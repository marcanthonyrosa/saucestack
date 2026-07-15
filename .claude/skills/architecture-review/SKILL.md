---
name: architecture-review
description: Two-pass architecture review. Pass 1 — architect designs in default mode. Pass 2 — fresh-context skeptical principal subagent reviews the design for holes. Triggers on "design the architecture", "design this feature", "architecture review", or after Phase 0 spec approval.
---

# Architecture Review — Two-Pass Pattern

The single-agent-confidence problem: an agent that designs is poorly positioned to critique its own design. The fix is a fresh-context adversarial pass. This skill orchestrates both.

## Workflow

### Pass 1: Design

Invoke `architect` in default mode:

> Read `specs/{feature}/00-master-plan.md` and `01-implementation-plan.md`. Read existing ADRs in `docs/decisions/`. Use Plan Mode. Ultrathink schema decisions. Produce `specs/{feature}/design.md` and the necessary ADRs in `docs/decisions/`.

Wait for completion. Confirm files exist.

### Pass 2: Skeptical principal review

Invoke `architect` in adversarial mode — **in a fresh context**:

> Read `specs/{feature}/00-master-plan.md`, `01-implementation-plan.md`, and `design.md`. Read every ADR in `docs/decisions/` that was created or modified for this feature. Act as a skeptical principal engineer. Find five things that will break in production and propose alternatives. Output `specs/{feature}/design-review.md` ordered: Critical / Warning / Suggestion. Do NOT edit `design.md` or any ADR.

The fresh context is what makes the second pass useful. If you reuse the design context, the reviewer is biased toward the choices already made.

### Synthesis

Read both `design.md` and `design-review.md`. For each Critical finding in the review:
- If legitimate → update `design.md` directly, or write a new superseding ADR
- If not → add a brief rationale to `design.md`'s "Trade-offs considered and rejected" section

Commit:
```bash
git add specs/{feature}/ docs/decisions/
git commit -m "spec({feature}): design + adversarial review"
```

## Phase gate

Before progressing to Phase 3 (tasks):
- Every Critical finding addressed (fix or documented rationale)
- Every ADR explainable in two sentences to a non-technical stakeholder
- Every load-bearing decision has an ADR

## Rules

- Pass 2 MUST run in a fresh context. Same-context "review" defeats the pattern.
- The reviewer does not edit. The designer (or human) edits.
- If Pass 2 finds nothing, that's a finding — push harder or accept low risk.
