---
name: full-review
description: Runs eight parallel review subagents (security, compliance, type safety, performance, accessibility, spec compliance, pattern conformance, test quality) on the current diff. Triggers on "review", "review the diff", "check before merge", or via the /review slash command. Use before any merge.
---

# Full Review — Eight Parallel Subagents

Spawn eight review subagents in parallel against the current diff. Synthesize findings into a prioritized report with a final verdict.

## Workflow

1. Identify the diff scope. Default `git diff main`. Override if user specifies a base branch.
2. Identify the feature being reviewed (branch name, recent commits, or ask).
3. Spawn all eight reviewers IN PARALLEL:
   - `security-reviewer`
   - `compliance-reviewer` (defaults to "out of scope" unless the spec declares sensitive data)
   - `type-safety-reviewer`
   - `performance-reviewer`
   - `accessibility-reviewer`
   - `spec-compliance-reviewer`
   - `pattern-conformance-reviewer` (new UI vs explicit style guide + implied codebase patterns)
   - `test-quality-reviewer`
4. Wait for all eight.
5. Synthesize into a single report at `reviews/{date}-{branch}.md`.

## Synthesis rules

Each reviewer produces Critical / Warning / Suggestion. Roll them up:
- **Combined Critical** = union of all Critical findings
- **Combined Warning** = union of all Warning findings
- **Combined Suggestion** = union of all Suggestion findings
- Deduplicate when two reviewers flag the same line; keep the more specific one.

## Final verdict

- **Ready to merge** — zero Critical
- **Needs attention** — zero Critical, but Warnings worth addressing
- **Needs work** — one or more Critical

If `compliance-reviewer` returns "Requires legal review," verdict is automatically "Needs work."
If `type-safety-reviewer` reports `pnpm typecheck` failing, verdict is automatically "Needs work."

## Output

```markdown
# Code Review — {feature} ({branch} vs {base})

## Verdict
**{Ready to merge | Needs attention | Needs work}**

{One-paragraph summary}

## Critical Findings ({N})

### Security
### Compliance
### Type Safety
### Performance
### Accessibility
### Spec Compliance
### Pattern Conformance
### Test Quality

## Warnings ({N})
{same structure}

## Suggestions ({N})
{same structure}

## Acceptance Criteria Coverage
{table from spec-compliance-reviewer}

## Reviewers
- Security: ✓ / ⚠ N findings / ✗ Critical
- Compliance: ✓ Out of scope / ⚠ / ✗
- Type Safety: ✓ / ⚠ / ✗
- Performance: ✓ / ⚠ / ✗
- Accessibility: ✓ / ⚠ / ✗
- Spec Compliance: ✓ / ⚠ / ✗
- Pattern Conformance: ✓ / ⚠ / ✗
- Test Quality: ✓ / ⚠ / ✗
```

## Rules

- Reviewers run in parallel. Sequential defeats the purpose.
- No code edits. Reviewers and this skill review only.
- No softeners. "Critical" means critical.
- If a reviewer crashes, flag it but don't block on it.
- Final report saved to `reviews/{date}-{branch}.md`.
