---
description: Run all pre-merge checks (tests, evals, security, spec compliance) and open the PR via gh. Does NOT merge — human merge is the last failsafe.
---

Run the `ship-pr` skill.

Steps:
1. Confirm clean working tree and branch is up to date with origin/main.
2. Invoke `ship-pr` skill.
3. Surface the PR URL when the skill reports complete.
4. Do not merge under any condition.
