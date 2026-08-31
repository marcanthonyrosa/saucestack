---
name: ci-audit
description: Audit this repo's GitHub Actions for cost and, more importantly, for whether the gate actually gates. Measures per-job minutes and failure rates, finds which checks are REQUIRED versus advisory, and computes how much of the test suite the blocking check really runs. Triggers on "audit CI", "why is CI so slow", "CI costs too much", "are our checks worth it", or /ci-audit.
---

# CI audit

A starter can only ship a good workflow to a NEW repo. Every repo that adopted
an older template, or hand-edited one, drifts — and nothing detects drift. This
skill is the pull-based half: run it against any repo, however far it has
wandered.

**Lead with coverage, not cost.** The expensive finding is almost never "this
job is slow". It is "the only check that can block a merge does not test
anything". Cheap-and-empty is worse than slow-and-real: it reports green, so
nobody looks.

## Run these, in this order

Numbers first. Do not propose a change before step 4.

### 1. What actually runs on a PR

```bash
gh pr list --state merged --limit 5 --json number -q '.[].number' | while read pr; do
  echo "=== PR $pr ==="
  gh pr view "$pr" --json statusCheckRollup \
    -q '.statusCheckRollup[] | "\(.name // .context)\t\(.conclusion // .state)"'
done
```

Count the DISTINCT checks, then count the rows. If a name appears twice, the
workflow triggers on both `push` and `pull_request` — every commit on an open PR
runs the whole matrix twice. Confirm:

```bash
gh api -X GET "repos/{owner}/{repo}/actions/workflows/ci.yml/runs?created=>$(date -v-30d +%F 2>/dev/null || date -d '30 days ago' +%F)&per_page=100" \
  --paginate --jq '.workflow_runs[].event' | sort | uniq -c
```

### 2. Which checks can actually block a merge

```bash
gh api repos/{owner}/{repo}/rulesets --jq '.[].id' | while read id; do
  gh api "repos/{owner}/{repo}/rulesets/$id" \
    --jq '.rules[] | select(.type=="required_status_checks")
          | .parameters.required_status_checks[].context'
done
gh api repos/{owner}/{repo}/branches/main/protection 2>/dev/null | head -20
```

Everything not listed is ADVISORY. Advisory jobs are pure cost — they cannot
stop anything. Note them; most of the savings live here.

### 3. Cost per job, and the failure rate

The `/timing` endpoint reports `0` on many repos, so derive from job timestamps.
GitHub bills per job, rounded UP to the minute.

```bash
for id in $(gh run list --workflow=ci.yml --limit 30 --json databaseId -q '.[].databaseId'); do
  gh api "repos/{owner}/{repo}/actions/runs/$id/jobs" \
    --jq '.jobs[] | [.name, .conclusion, .started_at, .completed_at] | @tsv'
done > /tmp/jobs.tsv
```

Aggregate per job name: run count, mean duration, summed billed minutes, and
failure rate. Then get the outcome mix:

```bash
gh api -X GET "repos/{owner}/{repo}/actions/workflows/ci.yml/runs?per_page=100" \
  --paginate --jq '.workflow_runs[].conclusion' | sort | uniq -c
```

**A failure rate above ~20% is the headline, not a footnote.** If CI is usually
red, red carries no information and every check below it is decorative. Find out
why before costing anything — read the failing STEP, not just the job:

```bash
gh api "repos/{owner}/{repo}/actions/runs/<id>/jobs" \
  --jq '.jobs[] | select(.conclusion=="failure")
        | "\(.name): " + ([.steps[] | select(.conclusion=="failure") | .name] | join(", "))'
```

A job failing at `supabase start` or `pnpm install` has run **zero tests**. That
is not a test failure, it is an outage — and it usually predates anyone noticing.

### 4. THE ONE THAT MATTERS — what does the blocking check cover?

Take the required check's command from the workflow, then compare what it runs
against what exists:

```bash
# every spec in the repo
find . \( -name '*.test.ts' -o -name '*.test.tsx' -o -name '*.spec.ts' \) \
  | grep -vE 'node_modules|/\.claude/|\.next' | wc -l
# what the required check actually runs, e.g. `vitest run tests/unit`
npx vitest list --filesOnly <its args> 2>/dev/null | wc -l
```

If the ratio is bad, that is the finding, and it outranks every cost number on
the page. Watch for the specific trap: a repo told to **co-locate tests with
source** whose gate runs `tests/unit` covers almost nothing by construction.

### 5. Structural checks — read the workflow and the test config

- `on: push` + `on: pull_request` → everything runs twice.
- No `concurrency:` → stacked pushes all run to completion.
- `paths-ignore` on the trigger **while that job is a required check** → a
  docs-only PR is blocked forever, because the check never reports. Use a step
  that always runs and skips the expensive part.
- `fileParallelism: false` (or equivalent) set globally → the infra-bound tests
  are serializing every pure test too.
- E2E env flags: grep the specs for the variable they gate on, then grep the
  workflow for it being SET. If nobody sets it, the suite is inert.

```bash
grep -rhoE 'process\.env\.[A-Z_]+' tests/e2e 2>/dev/null | sort -u \
  | sed 's/process\.env\.//' | while read v; do
      printf '%-28s specs:%s workflow:%s\n' "$v" \
        "$(grep -rl "$v" tests/e2e | wc -l)" \
        "$(grep -rl "$v" .github/workflows | wc -l)"
    done
grep -rc "describe\.skip\|test\.skip" tests/e2e 2>/dev/null | grep -v ':0$'
```

A suite reporting "48 skipped" is not passing. It is absent.

## Report

Ranked by what it costs, with the coverage finding first if there is one. For
each: the measurement, the fix, and what the fix gives up. Give a
before/after table with runs/month, billed minutes, and PR feedback time.

Then say plainly which of these the repo has, since these are the ones that
recur:

1. The blocking check covers a fraction of the suite.
2. Advisory jobs carry most of the spend.
3. Both triggers fire, so everything runs twice.
4. CI is habitually red, so red means nothing.
5. A globally-serialized test config taxes the fast tests.
6. A gated suite that CI never un-gates.

## Fixing

`.claude/templates/ci.yml`, `nightly.yml`, and `vitest.route*.ts` are the shape
this converges on. Do not paste them over a repo blind — the audit tells you
which parts it needs.

**Sequence matters.** If CI is red, fix that FIRST: every other measurement is
taken through a broken pipe. Then cut triggers and scope, then split the suite,
then move the required check. Moving the required status check is the last step
and the only one that touches repo settings — verify the new check has reported
green on a real PR before you point the ruleset at it, and remember the check's
name is the JOB name.

One trap worth stating once: **repairing CI without cutting its scope usually
costs MORE**, because a green expensive suite runs to completion where a broken
one died at setup in four minutes. Cut and repair in the same change.

Escalate anything generalizable back to the starter with `/saucestack-feedback`.
