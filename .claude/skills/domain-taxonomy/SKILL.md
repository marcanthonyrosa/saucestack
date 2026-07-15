---
name: domain-taxonomy
description: Drafts the domain-taxonomy doc — the shared vocabulary every downstream doc inherits. Generalizes the "signal taxonomy" pattern (lagging facts → leading interpretations with composition arrows, audience, implied action) for any observation, intelligence, monitoring, fraud-detection, or alerting system. Triggers on "draft the taxonomy", "write the domain vocabulary", "/domain-taxonomy".
---

# Domain Taxonomy

The doc that names the things. Every system that ingests observations and derives interpretations needs a shared vocabulary before data-model or architecture can start. Skipping this step is the #1 cause of "we keep arguing about what to call this" later.

This skill produces `docs/{project-slug}/domain-taxonomy.md` (rename the file if your domain has a sharper name — e.g., `signal-taxonomy.md`, `event-taxonomy.md`).

## When to use

- The project has a domain primitive distinction already declared in product-vision.md (e.g., Events vs Signals, Inputs vs Decisions, Raw vs Derived).
- Multiple downstream docs (data-model, architecture, milestone outlines) will use the same vocabulary.
- The system observes something and derives interpretations — observability, fraud, intel, alerting, monitoring, scoring, recommendation, decision-support.

Skip this skill if the project is a pure transaction system with no observation/derivation layer.

## Workflow

1. **Read product-vision.md.** The conceptual primitive declared there governs everything in this doc. If vision doesn't exist yet, halt and direct the user to run `/product-vision` first.
2. **Ask clarifying questions in ONE batch.** Cover:
   - What the system observes (the raw inputs, the lagging-fact category)
   - What the system derives (the leading-interpretation category)
   - Sources — both external (APIs, scrapes, integrations) and internal (uploads, team notes, manual entry)
   - Audiences — which roles consume which interpretation
   - Implied actions — what does each interpretation suggest the audience DO
   - Cross-cutting filter dimensions every view will need (cohort, geography, status, severity, ownership, time window)
3. **Wait for answers.** Do not draft until replied.
4. **Draft with the exact section structure below.**
5. **Halt.** Tell the user the draft is ready for review. This doc is the input for `/data-model`.

## Section structure

### `## The two layers (recap)`
Re-anchor on the conceptual primitive declared in product-vision.md. Two short paragraphs:
- Layer 1 (lagging / observed / raw facts) — what they are, what they encode
- Layer 2 (leading / derived / interpretations) — what they are, what they trigger

State explicitly: "This will evolve. Treat as v1." This invitation to revise is part of the discipline.

### `## {Layer 1} categories`
Grouped tables. Each row: name / one-line description / sources / what it composes into (the Layer-2 things it can feed).

Use 3-6 category groupings (e.g., Funding & Financial / Regulatory & Product / Talent & Growth / General). One table per group.

### `## {Layer 2} types (working v1)`
A single table. Each row:
- **Name** — short, lowercase, hyphenated (e.g., `churn-risk`, `upgrade-ready`)
- **Predicts** — the implied future state
- **Triggered by** — composition of Layer-1 things that fire this
- **Audience** — which role owns the response
- **Implied action** — what the audience should DO when this fires

"Implied action" is the column that forces "so what?" into the taxonomy. Refuse rows without an action.

### `## Data shapes (informational, not normative)`
What a Layer-1 card and a Layer-2 item carry on screen — narrative, not schema. End with: "Canonical structure defers to `data-model.md`." Resist the urge to put column types here.

### `## Sources`
Two lists: external and internal. External = APIs, scrapers, integrations. Internal = email, upload, manual entry, team notes. Each source gets a short note on what categories it feeds.

### `## Filterability requirements`
Cross-cutting dimensions every view must support. Cohort, geography, ownership-tier, status, severity, time window, etc. Numbered or bulleted.

### `## Open questions`
Numbered. Each open question is scoped to taxonomy concerns — naming, composition rules, audience routing. Questions about schema belong in data-model.md.

## Disciplines

1. **Lagging vs leading is repeated.** The two-layer distinction is the load-bearing primitive. State it again here even though the vision already did.
2. **Composition arrows are bidirectional.** Every Layer-1 row names which Layer-2 things it feeds. Every Layer-2 row names what triggers it. Two-way visibility.
3. **Implied action is mandatory per Layer-2 row.** A signal without an action is noise.
4. **Audience per Layer-2 row.** Forces the routing question into the vocabulary.
5. **Data shapes are informational.** This doc owns names and relationships; data-model owns schema. The handoff is explicit.
6. **v1 framing.** Taxonomy WILL evolve. Frame it that way upfront.
7. **Domain-specific naming.** Lowercase, hyphenated, no marketing language. `churn-risk` not "Active Funding Opportunity Indicator."

## Anti-patterns to refuse

- DDL or column types in this doc. Belongs in data-model.md.
- Layer-2 rows with no audience or no implied action. They are decoration, not signal.
- Vague source list ("various APIs"). Name specific sources.
- "Future taxonomy expansion" sections. Keep the doc tight to v1.
- Re-defining the conceptual primitive from vision. Recap, don't redefine.

## Handoff

- **Reads from:** product-vision.md (conceptual primitive)
- **Used by:** data-model.md (canonical shapes), system-architecture.md (which categories flow where), milestone-outline.md (per-milestone subset of the taxonomy), product-roadmap.md (which Layer-2 types appear in which milestone)

## Output

- File: `docs/{project-slug}/domain-taxonomy.md` (or a sharper domain name like `signal-taxonomy.md`)
- If the domain has a natural primitive name, prefer that over the generic "taxonomy"
