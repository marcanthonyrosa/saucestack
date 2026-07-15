---
name: milestone-outline
description: Drafts a per-milestone outline — scope, named discovery evidence, acceptance criteria, non-goals, open questions. One file per milestone. Triggers on "scope milestone N", "draft the milestone outline", "/milestone-outline".
---

# Milestone Outline

The per-milestone scoping doc. Vision and roadmap are project-wide; this is one specific slice. A reader should be able to answer "for THIS milestone, what ships, for whom, with what acceptance criteria, and what is explicitly deferred" in five minutes.

This skill produces `docs/{project-slug}/milestone-{N}-outline.md` where `{N}` is the milestone number (e.g., `milestone-1-outline.md`).

## When to use

- Vision and roadmap exist, and a specific milestone is being scoped to start work.
- One file per milestone. Do not bundle multiple milestones into one outline.
- Before any feature spec work begins on the milestone.

## Workflow

1. **Read product-vision.md, roadmap.md, domain-taxonomy.md, data-model.md, system-architecture.md.** All five inform the outline. Halt if vision or roadmap is missing.
2. **Confirm which milestone** the user is scoping. If unclear, ask.
3. **Ask clarifying questions in ONE batch.** Cover:
   - The specific job this milestone brings — narrower than vision's full JTBD set
   - Named discovery evidence — meetings, dates, people. Not "we talked to users."
   - Primary success criteria — time-bounded, observable, falsifiable
   - Secondary success criteria — system-quality metrics
   - Sub-milestone scope — what are the discrete deliverables, which is load-bearing
   - Per-sub-milestone acceptance criteria — testable bullets
   - Non-goals at milestone scope — what is explicitly deferred to a later milestone
   - Open questions — with named owners
4. **Wait for answers.**
5. **Draft with the section structure below.**
6. **Halt.** Tell the user the draft is ready. Feature specs come AFTER this is approved.

## Section structure

### `## Description`
One paragraph. What this milestone is, in plain language. Should read like the elevator pitch for the slice.

### `## Problem`
Bulleted current-state pain specific to this milestone. Narrower than vision's broader problem. Each bullet should pass the "if we solve this, the user will notice" test.

### `## Why now`
Discovery evidence — named meetings and dates. NOT "we did user research." Format:
- `{Person name}, {date}` — what they said
- Repeat for each load-bearing data point

If the discovery evidence is thin, halt and tell the user to do more discovery before scoping the milestone.

### `## Users and jobs`
A table:
| Team | Named people | Job this milestone brings |

Tighter than vision's audience section. Names, not roles only.

### `## Success criteria`
Two sub-sections:
- **Primary:** time-bounded, observable wins. "Within 30 days of launch, the team logs into the system before reaching for the spreadsheet ≥ 50% of the time."
- **Secondary:** system-quality metrics. "≥80% accuracy on spot-check of the system's derived outputs."

Refuse "users will love it" or "improves engagement."

### `## Scope`
A sub-milestone table:
| Sub-milestone | Deliverable | Load-bearing? |

Mark which sub-milestone is load-bearing (gates the others) vs compounding (independent value). One load-bearing is typical.

### Per-sub-milestone detail
One `### {Sub-milestone name}` per sub-milestone. Each contains:
- **Hero surface** — the screen / endpoint / artifact this produces
- **What's tracked** — which entities and which fields land
- **Data model touchpoints** — which tables are read or written
- **Sourcing hypothesis** — where the data comes from and whether it's deterministic or probabilistic
- **Seeding strategy** — how the first N rows arrive (manual seed, scraped, imported)
- **Acceptance criteria** — testable bullets. Each one is something a human or a test can verify.

### `## Non-goals`
Bullet list. Things adjacent to this milestone that are explicitly deferred. Each non-goal points to where it actually lives (next milestone, separate product, never).

### `## Open questions`
Numbered. Each open question has a named owner. Format: `{N}. {Question} — owner: {Name}`.

### `## What comes next`
A pointer to the roadmap section for the next milestone. Single sentence.

## Disciplines

1. **Discovery evidence is named.** People, dates, meetings. Anonymous research doesn't count.
2. **Acceptance criteria are testable.** Each bullet maps to something a test or a human can verify in under 5 minutes.
3. **Primary vs secondary success is separated.** User-behavior wins are not the same as system-health metrics.
4. **Load-bearing sub-milestone is called out.** Which sub-piece, if delayed, blocks the others.
5. **Open questions have owners.** Accountability built in.
6. **Non-goals are re-declared.** A milestone outline without non-goals is incomplete.
7. **Defers to vision.** Don't re-litigate the product's jobs here. Point to vision and move on.

## Anti-patterns to refuse

- Anonymous "stakeholders." Names or named roles or refuse.
- "Users will love it" success criteria. Demand observable.
- Acceptance criteria that read like marketing copy. Demand "verifiable in 5 minutes."
- Bundling multiple milestones into one outline. One file per milestone.
- Re-deriving the vision's JTBD set. Point to vision.
- Open questions without owners. Force the assignment.

## Handoff

- **Reads from:** product-vision.md (jobs, non-goals, constraints), product-roadmap.md (which milestone, sequencing rationale), domain-taxonomy.md (which categories ship), data-model.md (touchpoints), system-architecture.md (surfaces)
- **Used by:** feature specs within the milestone (pm-spec-author agent or equivalent), engineering planning
- **Defers to:** feature specs (per-feature acceptance criteria), test plans (specific test cases)

## Output

- File: `docs/{project-slug}/milestone-{N}-outline.md`
- One outline per milestone. Never bundle.
