---
name: ship-pr
description: Orchestrates the final pre-merge checks and opens the PR. Runs full test suite, eval suite (if applicable), security review, drafts PR description, opens PR via gh. Does NOT merge — human merge gate is the last failsafe. Triggers on "ship", "ship pr", "open pr", "/ship-pr".
---

# Ship-PR — Run Checks, Open PR, Stop

The final pre-merge orchestration. Garry Tan's YC data is unambiguous: agents code well, debug poorly. Humans remain load-bearing on production triage. This skill respects that.

## Workflow

### 1. Verify branch state

```bash
git status
git fetch origin main
git rev-list --count HEAD ^origin/main    # commits ahead of main
```

If branch has uncommitted changes, stop and report. If branch is behind main, stop and ask to rebase or merge.

### 2. Run all tests

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e   # if PREVIEW_URL is set, run against preview
```

If any fail, **stop and report**. Do not proceed.

### 3. Run evals (if Phase 7 applies)

If `evals/{feature}/promptfooconfig.yaml` exists:
```bash
pnpm promptfoo eval --output evals/runs/$(date +%Y-%m-%d).jsonl
```

Compare pass rate against last run on `main`. If regression > 5%, **stop and report**.

### 4. Run security review on the diff

Invoke `security-reviewer` subagent against `git diff main`. If Critical findings, **stop and report**.

### 5. Verify spec compliance

Invoke `spec-compliance-reviewer`. Pull the AC coverage table. If any AC is unmet, **stop and report**.

### 6. Draft PR description

Read commits on the branch. Read the feature's `00-master-plan.md`. Build:

```markdown
## Summary
{One-paragraph: what shipped and why}

## Spec
- Feature: `specs/{feature}/`
- ACs implemented: {N/N} (see spec-compliance review below)

## Changes
- {File group 1}: {what changed}
- {File group 2}: ...

## Tests
- Unit: {N added}
- Integration: {N added, including RLS tests for any new table}
- E2E: {N added}
- Coverage notes: {anything material}

## Evals (if applicable)
- Level 1 pass rate: {X%} (baseline: {Y%})
- Level 2 κ: {Z} (≥ 0.6 required)

## Breaking changes
- {List, or "None"}

## Manual QA checklist
- [ ] Log in as admin, perform critical journey from `03-user-journeys.md`
- [ ] Verify RLS prevents non-admin from {action}
- [ ] {feature-specific check}

## Notes for reviewer
- {Anything non-obvious worth flagging}

## How to roll back
- {Migration revert command if applicable, otherwise: revert commit}
```

### 7. Open the PR

```bash
gh pr create --base main --head $(git branch --show-current) \
  --title "feat({scope}): {feature one-liner}" \
  --body-file /tmp/pr-body.md
```

### 8. Fresh-context final check

Invoke a fresh-context subagent (use the `spec-compliance-reviewer` again, fresh):

> Read the open PR diff. Read `specs/{feature}/00-master-plan.md`. Answer in one paragraph: does this PR fully and exclusively implement the spec? List any spec requirements not implemented and any code not justified by the spec.

Append the answer as a PR comment.

### 9. Stop

**Do not merge.** Report PR URL and stop. The human merges.

## Output

```
SHIP-PR COMPLETE

PR: {URL}
- Tests: ✓ all green ({N} tests)
- Evals: ✓ pass rate {X%} (or N/A)
- Security: ✓ no critical findings
- Spec compliance: ✓ all ACs implemented

PR description drafted. Fresh-context spec check appended as comment.

⏸  HUMAN MERGE GATE. Review the PR and merge when ready.
```

## Rules

- **Never auto-merge.** The human merge button is non-negotiable.
- **Stop on any red signal.** Tests, evals, security, spec — any of them fails, stop and surface.
- **PR description is structured.** No prose-only summaries.
- **Manual QA checklist always present.** Even for "small" features.
- **The fresh-context final check happens on the PR**, not before, so it sees what the reviewer sees.
