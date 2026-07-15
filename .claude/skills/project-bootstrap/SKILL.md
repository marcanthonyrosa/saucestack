---
name: project-bootstrap
description: Orchestrates the full project-bootstrap framework — vision → taxonomy → data-model → architecture → roadmap → milestone-1 outline. Six Claire-Vo-influenced docs, written in dependency order with human review gates between each. Triggers on "bootstrap the project", "kick off a new project", "draft the project framework", "/project-bootstrap".
---

# Project Bootstrap

The orchestrator for the six-doc framework that anchors a new project from scratch. Each underlying doc has its own skill (`/product-vision`, `/domain-taxonomy`, etc.); this skill walks the sequence and enforces the review gates between them.

The framework is Claire-Vo-influenced: JTBD with canonical loss stories, explicit non-goals at every level, falsifiable success, structural wedge for "why now," deferred-decision discipline, doc-to-doc handoffs with explicit "lives elsewhere" pointers.

## When to use

- Brand-new project, before code exists or while it's still trivial.
- Inherited project where the framework docs are missing or stale and downstream decisions are thrashing.
- Cross-project pattern reset — when a team is starting a second product and wants to apply the same discipline.

Do NOT use for feature-level specs within an existing project. Those are downstream of this — use a feature-spec skill or the `pm-spec-author` agent.

## The six docs, in dependency order

| # | Doc | Skill | What it answers | Output file |
|---|---|---|---|---|
| 1 | Product vision | `/product-vision` | What is this, for whom, why now, what is it deliberately not? | `docs/{slug}/product-vision.md` |
| 2 | Domain taxonomy | `/domain-taxonomy` | What does the system observe, what does it derive, what is the shared vocabulary? | `docs/{slug}/domain-taxonomy.md` (or sharper name) |
| 3 | Data model | `/data-model` | What entities exist, how do they relate, what's the trust model? | `docs/{slug}/data-model.md` |
| 4 | System architecture | `/system-architecture` | How is the system physically put together — boundaries, flows, interfaces? | `docs/{slug}/architecture.md` |
| 5 | Product roadmap | `/product-roadmap` | In what order do we build, what depends on what, what is deliberately deferred? | `docs/{slug}/roadmap.md` |
| 6 | Milestone-1 outline | `/milestone-outline` | For the first milestone specifically — what ships, with what acceptance criteria, what's deferred? | `docs/{slug}/milestone-1-outline.md` |

Skip taxonomy (#2) if the project is a pure transaction system with no observation/derivation layer. Every other doc is required.

## Workflow

1. **Establish the project slug.** Ask the user for a short kebab-case name to use under `docs/`. Confirm before proceeding. Do not invent.
2. **Confirm scope.** Ask whether this is a brand-new project (run all six) or a partial bootstrap (refresh a subset). For a refresh, ask which docs to (re)draft.
3. **For each doc in order:**
   - Announce which doc is starting and what it answers
   - Invoke the per-doc skill (e.g., `/product-vision`)
   - **Halt for human review.** Do not auto-advance to the next doc. The human must explicitly approve before the next skill runs.
   - When the human approves, move to the next doc
4. **Final summary.** When all six are drafted and approved, output a short summary: file paths, the seven cross-cutting disciplines that show up across docs, what's NOT in scope (feature specs, DDL, test plans), and what the natural next step is (scope the first feature inside milestone 1).

## Review gates (enforced)

- After vision: vision must be approved before taxonomy starts. The conceptual primitive declared in vision governs the taxonomy's two-layer recap.
- After taxonomy: taxonomy v1 must be approved before data-model starts. Data-model inherits vocabulary.
- After data-model: entity map must be approved before architecture commits to flows.
- After architecture: boundary diagram must be approved before roadmap starts naming surfaces per milestone.
- After roadmap: M1 must be load-bearing-spine-shaped before its outline gets written.
- After M1 outline: framework is complete. Feature specs come next, outside this skill.

If a human says "skip the gate, just keep drafting," push back once. Explain: each doc's value depends on the upstream doc being committed. Premature drafts encode upstream uncertainty into downstream concrete. If they still insist, comply.

## The seven cross-cutting disciplines

Every per-doc skill enforces these. List them at the end of the bootstrap so the user sees the through-line:

1. **JTBD over feature lists.** Jobs come with canonical loss stories — named, dated specifics.
2. **Explicit non-goals at every level.** Vision, roadmap, milestone outline all carry their own non-goals.
3. **Falsifiable success.** Observable behaviors or numbers with timeframes, never NPS/DAU theater.
4. **Structural wedge for "why now."** Scale break or technology shift, not a competitor or trend.
5. **Deferred-decision discipline.** "Decide based on what M(n) teaches" is healthy, not weak.
6. **Doc-to-doc handoffs.** Each doc states what it's NOT responsible for and points to who is.
7. **Open questions with owners.** Uncertainty is named, scoped, and assigned.

## Anti-patterns to refuse

- Drafting docs in parallel. Order is load-bearing.
- Skipping vision because "it's obvious." If it's obvious, the doc takes 20 minutes to write — write it anyway.
- Drafting taxonomy before vision is approved. The conceptual primitive must be locked first.
- Auto-progressing through gates without explicit human approval.
- Filling docs with placeholders ("TBD," "stretch," "TBD-decide-later"). Either ask the user for the answer or surface it as an open question with an owner.
- Bundling all six docs into one mega-file. Each doc has its own audience and reading mode.

## What this skill does NOT produce

- DDL (lives in migration files)
- Feature specs (use `pm-spec-author` or equivalent)
- Test plans (use test-author skills)
- UI mockups (use ux-prototyper or a design surface)
- Onboarding docs / READMEs (separate concern)

## Output summary (final step)

When the bootstrap is complete, post a short summary to the user:

```
Project bootstrap complete — docs/{slug}/

  product-vision.md         ← the stable contract
  domain-taxonomy.md        ← shared vocabulary
  data-model.md             ← entities + trust model
  architecture.md           ← system shape
  roadmap.md                ← sequenced milestones
  milestone-1-outline.md    ← M1 scope + acceptance criteria

Next step: scope the first feature inside milestone 1. Use pm-spec-author
(or your feature-spec skill) — pointed at docs/{slug}/milestone-1-outline.md.
```
