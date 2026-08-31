# CI leanness — what the audit found, and why the templates look like this

`.claude/templates/ci.yml` used to be a reasonable file: it triggered on PRs and
merges rather than every push, it set `concurrency`, it gated the expensive jobs
behind the fast ones with `needs:`, and it capped every job with
`timeout-minutes`. All of that is still true.

Then a repo running an older copy of it was audited across 751 workflow runs.
The template was not the problem. What the audit found was worse and more
interesting, and it is why the templates now look the way they do.

## The finding

**Eight checks on every PR. One of them could block a merge. That one ran five
spec files out of 1020.**

The eight were three jobs fired twice — the workflow had drifted to trigger on
both `push` (all branches) and `pull_request`, so every commit on an open PR ran
the whole matrix twice — plus two provider statuses. The branch ruleset required
exactly one context, and that job ran `vitest run tests/unit`.

`tests/unit/` held five files: a CSS-token check, a design-system markdown
coverage check, a badge-contrast check, a migration-numbering check, and a smoke
test. Not one line of business logic. The other 853 co-located specs — the ones
the project's own rules *require* you to write next to the source — gated
nothing at all.

Meanwhile the two jobs that did run the real suite had failed **76% of the
time** (573 of 751 runs) and merges happened anyway, because neither was
required. The cause was a single line in a migration:

```sql
if still_open <> 10 then
  raise exception '0179: expected 10 open P-12 signals after close, found %', still_open;
```

Ten was true on production, where the number was measured. CI applies migrations
to a fresh, unseeded database, where the count is zero. So the migration raised,
`supabase start` exited 1, and both the database and Playwright jobs died at
setup — having run zero tests — on every branch, for weeks. Red was the normal
state, so red carried no information.

The Playwright job was its own story. `PLAYWRIGHT_AUTHED` was never set by any
workflow, and 16 of 24 spec files gated on it; 25 `describe` blocks were
hard-skipped besides. The job spent ~290 seconds of setup to execute 19 seconds
of tests — in practice a single assertion that an unauthenticated visit
redirects to `/login`. It had never caught a regression in its life.

Roughly 16,000 Actions minutes a month, to gate, in practice, nothing.

## The rules that came out of it

**Coverage before cost.** A cheap gate that tests nothing is not a saving. It
reports green, so nobody looks, and the jobs that *would* have caught something
sit advisory and ignored. Measure "files the required check runs ÷ files that
exist" first. Everything else is secondary.

**Route tests by what they reach for, not by where they live.** "Unit tests live
in `tests/unit`" contradicts "co-locate tests with the file they test". Follow
both and the directory is empty of anything that matters. Filename conventions
fare no better — only 29 of ~200 database specs in that repo used the
`*.integration.test.ts` suffix. Read the file: does it reach for the database
helper, or construct a real client it hasn't mocked?

**Serialize only what needs it.** `fileParallelism: false` is global. Set to
protect the ~200 specs sharing one Postgres, it serialized the ~800 that share
nothing. The full suite took 27 minutes; the fast half, split out and run
parallel, takes 88 seconds and covers 818 files.

**Never `paths-ignore` a required check.** A check that never *reports* leaves
the PR blocked forever. Run the job always; skip the expensive part in a step.
And fail open — if the changed-file lookup breaks, run the tests, because a
silent skip on a broken lookup is how a gate stops gating.

**A gated-off suite must be gated on somewhere real.** The "skip, don't throw"
rule is right — a red CI meaning "your fixture environment is wrong" trains
people to ignore red CI. Its failure mode is a suite that is skipped, green and
inert forever. Set the flag in a scheduled job, and read the skip count.

**Migration post-conditions assert size-independent invariants.** Assert the
rows you targeted, not the corpus. And check the guard can still *reject* —
neuter the change it protects and confirm it raises. A post-condition that
cannot fail is decoration.

**Repair and cut in the same change.** Fixing the migration without also cutting
scope would have roughly *doubled* the bill — a green 27-minute suite costs far
more than a broken one that dies at setup in four. Estimated ~$104/mo → ~$203/mo
for the repair alone, versus ~$3/mo for repair plus cuts.

## The shape it converged on

| | Before | After |
|---|---|---|
| Checks on a PR | 8 | 2 |
| Files the blocking gate runs | 5 | 819 |
| PR feedback | ~4 min to red | ~90 s |
| Actions minutes/month | ~16,000 | ~1,400 |

- **pull_request** → one job, everything that needs no infrastructure.
- **push to main** → that, plus the database suite.
- **nightly** → database, typecheck, and the browser suite, with failures filed
  as an issue that has an assignee.

Typechecking left the PR path entirely: the framework's build already
typechecks the whole project on every preview deploy, so `tsc --noEmit` in
Actions was the same work twice. It runs nightly as a backstop.

## The part a template cannot fix

The audited repo's CI was **worse than the template it was bootstrapped from**.
Someone had hand-edited it, added a `push` trigger, and pointed the gate at a
directory that stopped being representative as the suite grew. No mechanism
noticed, because a copy-once starter only ever reaches *new* repos.

That is why `/ci-audit` exists. Templates are the push half; the auditor is the
pull half, and it is the one that reaches the repos that already drifted. Run it
once after adopting saucestack, and again whenever CI starts to feel expensive
or slow.
