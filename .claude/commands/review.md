---
description: Run the full eight-agent code review against the current diff. Spawns security, compliance, type safety, performance, accessibility, spec compliance, pattern conformance, and test quality reviewers in parallel and synthesizes a verdict.
argument-hint: [base-branch]
---

Run the `full-review` skill against the current diff.

If $ARGUMENTS is provided, use it as the base branch. Otherwise default to `main`.

Steps:
1. Confirm the diff is non-empty (`git diff $BASE_BRANCH --stat`).
2. Invoke the `full-review` skill.
3. Save the report to `reviews/$(date +%Y-%m-%d)-$(git branch --show-current).md`.
4. Print the verdict line and the path to the full report.

If verdict is "Needs work," do not auto-fix. Surface findings and let the user direct what to address.
