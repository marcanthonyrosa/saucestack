---
description: Audit this repo's GitHub Actions — what each check costs, which ones can actually block a merge, and how much of the test suite the blocking one really runs.
argument-hint: [optional focus, e.g. "cost only" or "just the gate coverage"]
---

Run the `ci-audit` skill.

Measure before proposing anything. Lead with gate COVERAGE — how much of the
suite the required check actually runs — because a cheap check that tests
nothing outranks every cost finding on the page.

If CI is currently red more often than not, diagnose that first: every other
number is measured through a broken pipeline, and a job that dies at setup has
run zero tests.

If $ARGUMENTS narrows the scope, honour it, but still report the coverage number.
