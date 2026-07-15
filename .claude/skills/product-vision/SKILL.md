---
name: product-vision
description: Drafts the product vision — the cornerstone artifact that locks what is being built, for whom, why now, and what it is deliberately not. Claire-Vo-influenced framework — JTBD with canonical loss stories, explicit non-goals, falsifiable 12-18 month picture, structural wedge. Triggers on "draft the product vision", "write the vision", "product vision", "/product-vision".
---

# Product Vision

The vision is the one doc that should be stable across the life of a project. Everything else — taxonomy, data model, architecture, roadmap, milestone outlines — is downstream and can churn. The vision is the contract that prevents that churn from drifting.

This skill produces a single file: `docs/{project-slug}/product-vision.md`. It does not produce roadmaps, schemas, or designs. It is upstream of all of those.

## When to use

- First doc on a brand-new project, before any other framework doc.
- When an existing project's "what we are" answer feels fuzzy and downstream decisions are thrashing.
- When non-goals are routinely violated and need to be re-anchored.

Do NOT use this skill for feature-level specs. For those, use the `pm-spec-author` agent or its equivalent — features are downstream of vision.

## Workflow

1. **Read context first.** Anything in `docs/`, `README.md`, `CLAUDE.md` / `AGENTS.md`, any prior vision draft, any discovery notes. If the project is brand new, ask where canonical source material lives.
2. **Ask clarifying questions in ONE batch.** Cover, at minimum:
   - The load-bearing conceptual primitive (the two-or-three-word distinction the rest of the system will inherit — facts vs interpretations, intents vs actions, raw vs derived, etc.)
   - Primary team / audience (who hires this product from day one) and the highest-severity job they hire it for
   - Secondary teams and downstream beneficiaries (and who breaks the tie when audiences disagree)
   - Two or three canonical loss stories — named, specific, dated failures the product would have prevented
   - The structural forces that make this buildable / valuable NOW (scale break, technology shift, regulatory shift — not a competitor or trend)
   - The 12-18 month picture: which observable team behaviors prove success
   - Adjacent products this is at risk of drifting into — the explicit non-goals (CRM, authoring tool, public dashboard, etc.)
   - Hard constraints: trust boundary, team size, regulatory posture, stack, integration scope
3. **Wait for answers.** Do not draft until the user has replied. Ambiguity → one more round of questions, never invented requirements.
4. **Draft the file** with the exact section structure below.
5. **Halt.** Tell the user the draft is ready for review. Do not proceed to taxonomy, data model, or roadmap.

## Section structure

Use these seven sections, in this order, with no leading numeric prefix:

### `## What it is`
One-paragraph elevator definition. Establishes the load-bearing conceptual model the rest of the system inherits. If there is a two-layer primitive (e.g., Events vs Signals, Inputs vs Decisions), declare it here with one bullet per layer.

### `## Who it's for`
Primary teams first, severity-ranked. Each primary team gets a bold-prefixed paragraph naming the team, the job they hire the product for, and the cost of failure. Secondary / downstream beneficiaries get one closing paragraph. Name the tiebreaker when audiences disagree.

### `## The N jobs {product} does`
JTBD framing. Each job is numbered (or rendered as a heading per job — both work). Each job carries:
- What the system catches / supplies / answers
- A canonical loss story OR a canonical near-miss — named, specific, dated
- The severity ranking ("highest-severity job", etc.) where it matters

### `## The wedge — why now`
Two-to-three paragraphs. Names the structural forces, not a market catalyst. Tests:
- If you delete this section and the doc still reads as motivated, the section isn't earning its keep
- "Why now" answers must be ones that did NOT apply 3+ years ago

### `## Where we are at 12-18 months`
Falsifiable future-state picture. Lead with the "spine" (the one capability that, if present, the project succeeded). Then "Layered on the spine" — additional capabilities. Then "The operational tests of success" — observable team behaviors, not NPS / DAU theater.

### `## Non-goals (explicit)`
A long, specific list. Each non-goal names a real adjacent product or feature this is at risk of drifting into. Format: `**Not a {adjacent thing}.** {Two sentences on why and where the boundary is.}` Eight or so is typical. Aggressive specificity beats safe generality.

### `## Constraints`
Bullets, bold-prefixed. The hard boundary conditions: trust boundary, team size, regulatory posture, stack, integration scope, data-sensitivity tiers, future-product handoffs. Constraints shape every downstream decision — be explicit.

## Disciplines (the Claire-Vo influence)

1. **JTBD over feature lists.** Jobs come with canonical loss stories — named, dated specifics — not personas.
2. **Explicit non-goals.** A vision without non-goals is incomplete. Each non-goal names a real adjacent product.
3. **Falsifiable future-state.** Operational tests of success are observable behaviors ("team opens X first, not a spreadsheet"), not metrics theater.
4. **Structural wedge.** "Why now" names structural forces (scale, technology, regulation), not competitors.
5. **Canonical loss stories.** "Vital Trace raised a round we did not know about" beats "we sometimes miss things."
6. **Severity ordering.** When jobs are listed, the highest-severity one is named as such. Forces prioritization out of the vision.
7. **Constraints up front.** Trust boundary, team size, regulatory posture are invariants, not discoveries.

## Anti-patterns to refuse

- A feature list masquerading as vision. Refuse and re-ask.
- Vague success metrics (NPS, DAU, "user engagement"). Demand observable behavior.
- Anonymous "stakeholders" or "users." Names or named-roles or refuse.
- "We'll figure out scope later." Non-goals are written in this doc or the doc isn't done.
- A vision that could apply to any product in the category. Specificity is the test.
- Re-litigating CLAUDE.md or governance docs inside the vision. Point to them; don't restate.

## Handoff

- This doc points outward only to: governance docs (CLAUDE.md / AGENTS.md), and the future-product handoff target (if any — e.g., a separate marketing curation app).
- Every other framework doc points back to this one. Vision is the root.
- Specifically: domain-taxonomy uses the conceptual primitive declared in "What it is." Data-model uses the trust-boundary tiers declared in "Constraints." Architecture inherits the stack constraint. Roadmap derives milestone sequencing from "The N jobs."

## Output

- File: `docs/{project-slug}/product-vision.md`
- If `{project-slug}` is not obvious, ask. Do not invent.
- Single doc. No appendices, no FAQ, no changelog. Vision reads as evergreen.
