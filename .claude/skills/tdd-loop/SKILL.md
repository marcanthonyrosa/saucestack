---
name: tdd-loop
description: Enforces strict Red → automated RED-quality gate → Green → Refactor TDD by delegating to isolated subagents. Runs autonomously — the gate replaces the human "go". Auto-triggers when implementing new features from a plan.md ledger item. Trigger phrases include "implement", "run tdd-loop", "next ledger item", "build T0X". Does NOT trigger for bug fixes (use regression-test-author flow), documentation, or configuration changes.
---

# TDD Loop — Red / RED-quality gate / Green / Refactor

Enforce strict Test-Driven Development for one ledger item from `specs/{feature}/plan.md`. The loop runs **autonomously**: an automated `red-quality-gate` verifies the failing test is sound before any implementation — replacing the old human "go" checkpoint. This guards the two failure modes that checkpoint existed for: agents collapsing RED and GREEN into one shot, and false-greens (tests that pass without proving anything) slipping through.

## Mandatory workflow

For each ledger item, run this loop. Do not skip phases. Do not batch items. The gate — not a human — authorizes the RED→GREEN transition.

### Phase 1: RED — Write failing test 🔴

Invoke the appropriate test-tier subagent based on what the ledger item touches:
- Pure logic, Zod schemas → `unit-test-author`
- Server actions, RLS, real Supabase → `integration-test-author`
- Browser flows → `e2e-test-author`
- Bug reproduction → `regression-test-author`

Each test-tier subagent inherits the contract from `tdd-test-writer`: write the test, run it, confirm it fails for the right reason, return path + failure output. **Cannot write or read production code.**

Output expected:
```
RED PHASE COMPLETE

Test file: tests/integration/migrations/items.test.ts
Run command: pnpm vitest run tests/integration/migrations/items.test.ts

Failure output:
{paste actual output}

Reason: relation "public.items" does not exist.

→ Handing to red-quality-gate.
```

### Phase 2: RED-QUALITY GATE — Prove the RED is sound (automated) 🚦

Invoke the `red-quality-gate` subagent with the test path, run command, RED failure output, and the ledger item + AC. It runs the test itself and verifies the RED is sound: fails for the right reason, actually exercises the target (would NOT pass against a trivial implementation), non-tautological assertions, matches the ledger item.

Act on its verdict:
- **PASS** → proceed to GREEN automatically.
- **REVISE** → send its corrections back to the test-tier subagent, re-run RED, re-gate. Cap at 3 rounds.
- **NO-OP** → verify-only smoke that legitimately passes at RED; commit it as a single-commit regression pin and skip GREEN (go to Phase 5).
- **ESCALATE** → the gate is genuinely uncertain. This is the *only* condition that pauses the loop for a human. Surface the gate's question.

The gate **fails closed** — anything it can't confirm becomes REVISE or ESCALATE, never a silent PASS. That is what makes autonomous RED→GREEN safe.

> Want a manual checkpoint on a specific item anyway? Tell the loop "gate to me" and it surfaces the RED for your review instead of auto-passing. Off by default.

### Phase 3: GREEN — Minimal implementation 🟢

Once the gate returns **PASS**, invoke `tdd-implementer` with:
- The failing test file path
- The failure output
- The ledger item definition

`tdd-implementer` has its own fresh context. It cannot modify the test. It writes the minimal code, runs the test, then runs `pnpm typecheck` and the full suite for regressions.

Output expected:
```
GREEN PHASE COMPLETE

Files changed: {list with line counts}
Tests passing: {N/N tests}
Typecheck: clean
Suite regression: none

Ready for REFACTOR.
```

**Gate:** if `tdd-implementer` requests to modify the test, STOP and surface to the human. This is exactly the failure mode the isolation prevents.

### Phase 4: REFACTOR — Clean up 🔵

Invoke `tdd-refactor` with the passing implementation. It improves naming, structure, narrowing. Re-runs tests after each edit. Reverts if anything breaks.

### Phase 5: COMMIT

```bash
git add -A
git commit -m "{conventional commit from ledger item}"
```

Tick the ledger item in `specs/{feature}/plan.md`. Report ready for the next item.

**Before ticking, if this item WRITES something another surface READS — run the reader.**

Green tests and a row count are producer-side evidence. They do not show that the thing
consuming the output can actually use it. The failure this prevents is not a crash; it is
a success report over an empty result:

> A sweep wrote 18 review candidates. The count said 18, the database held 18, the tests
> were green. Every row carried `title: null` against the reading page's
> `z.string().optional()` field, which rejects null — so the page parsed, dropped all 18,
> and rendered "nothing waiting for review". Reported done three times before anyone ran
> the reader.

The check is usually one command: render the page, call the endpoint, run the parser over
the rows you just wrote. If the consumer is not runnable locally, say so explicitly in the
commit and name what will exercise it (CI, a preview deploy) rather than implying it was
verified.

## Anti-patterns the `tdd-guard` hook also blocks

These are enforced by hook, not just by agent prompt:
- Writing production code when no failing test is scoped → blocked
- Editing test files during the GREEN phase → blocked
- Deleting test files without explicit human approval → blocked

## Stop conditions

Surface to the human immediately if:
- A test passes on the first run AND the gate does not classify it as a verify-only NO-OP (RED failed — the test is too weak or mocked badly)
- `tdd-implementer` wants to modify the test
- `tdd-refactor` reverts more than 3 attempts on the same area
- The full suite regresses (any previously-passing test now fails)
- `pnpm typecheck` fails after green
- The ledger item seems to require multiple commits (decompose first)
- The item writes data a surface you cannot run consumes, so the consumer check above is impossible locally (say what will cover it instead of quietly skipping it)

## Output

After each completed item:
```
Item {N}: ✓ COMPLETE
- Test: {path}
- Implementation: {files}
- Commit: {sha} {message}
- Suite: {N passing, 0 failing}
- Ledger: {N}/{total} items done
```

After all ledger items, report ready for `/review` and `ship-pr`.
