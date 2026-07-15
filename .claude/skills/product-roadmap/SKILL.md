---
name: product-roadmap
description: Drafts the product roadmap — milestone sequencing with status taxonomy, dependency reasoning, and deferred-decision discipline. Sequenced bets, not Gantt theater. Triggers on "draft the roadmap", "sequence the milestones", "product roadmap", "/product-roadmap".
---

# Product Roadmap

The doc that says "in what order, and what depends on what." It is the most likely framework doc to churn — that's intentional. Vision stays stable; roadmap moves with what each milestone teaches.

This skill produces `docs/{project-slug}/roadmap.md`.

## When to use

- Vision and domain taxonomy are drafted. Optionally also data-model and architecture (helpful but not required).
- When milestone sequencing is being debated and the team needs an artifact to point to.
- After a milestone ships and the next milestone needs to be picked.

## Workflow

1. **Read product-vision.md and domain-taxonomy.md.** If vision is missing, halt and direct to `/product-vision`.
2. **Ask clarifying questions in ONE batch.** Cover:
   - The candidate set of milestones (M1, M2, M3 … sketched, even if rough)
   - Which milestones are dependency-locked (e.g., M2 needs M1's data shape)
   - Which milestones are hypothesis-driven (must declare falsifiable success up front)
   - Any "decide based on what M1 teaches" milestones — the deferred ones
   - Things that were previously declared out-of-scope but might re-enter
3. **Wait for answers.**
4. **Draft with the section structure below.**
5. **Halt.** Tell the user the draft is ready for review. Each milestone gets its own outline via `/milestone-outline`.

## Section structure

### Header note
A short italic note declaring the contract: "This roadmap is living; the vision is stable. Sequencing here changes as milestones teach us what to do next." Sets reader expectation.

### `## How this doc works`
Meta-section: what belongs here and what doesn't.
- **Belongs here:** status, what ships, dependencies, sequencing rationale, optional falsifiability hypothesis per milestone
- **Does NOT belong here:** DDL (lives in data-model.md / migrations), mockups (live in design surfaces or feature specs), feature-level acceptance criteria (live in milestone outlines)

### `## Milestones`
One `### {Milestone-name}` subsection per milestone. Each contains:
- **Status:** `in progress` / `planned` / `not yet scoped` / `candidate` (pick one — be honest)
- **What ships:** 2-4 bullets, terse
- **Dependencies:** what this needs from prior milestones, or "none"
- **Sequencing rationale:** why this milestone now, relative to others
- **Falsifiability (optional):** if hypothesis-driven, the precision hypothesis (e.g., "≥30% of scored ≥70 express need within 6 months")

Order milestones by intended sequence, not priority alone — the order on the page IS the sequence.

### `## Open / not-yet-scoped milestone`
A deliberate "we'll decide based on what M(n) teaches" slot. List candidate directions in priority order WITHOUT pre-committing.

This section is part of the discipline. Refuse to predict beyond what's been earned.

### `## Re-evaluated from permanent out-of-scope`
Things previously excluded (in vision's non-goals or elsewhere) that have become feasible or worth reconsidering. Each entry names what changed.

Empty initially is fine. Include the heading so the discipline of revisiting is visible.

### `## {Cross-cutting evolution}`
A section that argues for ordering by tracing one structural dimension across milestones. The most common is:
- **Data model evolution** — which entities enter at which milestone, and why each enters only when the next value prop structurally requires it

Other versions:
- **Trust-tier evolution** — when restricted-tier features come online
- **Integration evolution** — which external systems get wired up at which milestone

### `## Last updated`
A line with the date. Implicit freshness signal.

## Disciplines

1. **Status taxonomy is enforced.** Every milestone has a status from the four-status set. No "tbd" or "soon."
2. **Sequencing rationale is mandatory.** Every milestone explains why now, relative to others. Not just what.
3. **Falsifiability where applicable.** Hypothesis-driven milestones carry a precision hypothesis. "Useful" is not a hypothesis.
4. **Deferred-decision discipline.** A "decide based on what M(n) teaches" slot is healthy, not weak.
5. **No Gantt theater.** No dates beyond "in progress / planned." Dates fake certainty.
6. **No implementation leakage.** DDL and mockups belong elsewhere — point, don't restate.
7. **Structural-requirement framing.** Entities and integrations enter "when the next value prop demands it," not on a guess.

## Anti-patterns to refuse

- Quarterly Gantt charts.
- "M3: AI features" placeholder slop. Either it's real enough to describe in two sentences or it doesn't belong here yet.
- Long lists of speculative future milestones. Two real ones beat ten fake ones.
- Mixing in design specs or DDL.
- "Stretch goals." Either a milestone is committed or it isn't.

## Handoff

- **Reads from:** product-vision.md (the jobs and non-goals that constrain sequencing), domain-taxonomy.md (what enters when)
- **Used by:** milestone-outline.md (per-milestone scoping pulls from this), engineering planning (which docs come next)
- **Defers to:** milestone-outline.md (per-milestone acceptance criteria), feature specs (within a milestone)

## Output

- File: `docs/{project-slug}/roadmap.md`
