---
name: data-model
description: Drafts the data-model doc — entities, relationships, trust-tier RLS posture, indexing reasons, migration discipline. Inherits taxonomy vocabulary; defers DDL to migration files. Triggers on "design the data model", "draft the data model", "/data-model".
---

# Data Model

Names the entities and their relationships at the level needed to reason about the system. NOT the place for full DDL — that belongs in migration files. This doc exists so a reader can answer "what entities exist, how do they relate, what's the access model, why are these indexes here" in five minutes.

This skill produces `docs/{project-slug}/data-model.md`.

## When to use

- Product vision and domain taxonomy are drafted and approved.
- Before writing the first schema migration.
- When the schema has drifted from the doc and reasoning about the system has become painful.

## Workflow

1. **Read product-vision.md and domain-taxonomy.md.** Halt if either is missing.
2. **Ask clarifying questions in ONE batch.** Cover:
   - Database stack (likely Postgres + RLS — confirm)
   - Trust tiers — who can read what (default tier vs restricted tier, or a more granular model)
   - The entity-set in scope for v1 (one entity per "noun" the taxonomy or vision keeps mentioning)
   - Which entities are restricted-tier (financial records, salary, PII/PHI, secrets, contractual rights, etc.)
   - Soft-delete needs (any entity?)
   - Time-series shape questions (event stream vs aggregate tables)
   - Sources of denormalization (which fields land flat on the parent vs in a child table)
3. **Wait for answers.**
4. **Draft with the exact section structure below.**
5. **Halt.** Tell the user the draft is ready for review.

## Section structure

### `## Stack assumption`
One paragraph. State the database invariants the rest of the doc assumes:
- Postgres (or whichever)
- RLS enabled from creation on every table
- UUID primary keys (or whatever the convention is — declare it)
- `created_at` / `updated_at` timestamps on every table
- Reference the governance doc (CLAUDE.md / AGENTS.md) for any stack rules

### `## High-level entity map`
A Mermaid `erDiagram`. Top-level boxes for each entity. Lines show relationships with cardinality. No fields in the diagram — that's what the per-entity sections are for.

### `## Core entities`
One `### {entity-name}` subsection per entity. Each contains:
- A one-sentence purpose line
- A bulleted column list with `column_name` and type (text, uuid, timestamptz, jsonb, enum)
- Inline flags for restricted-tier columns or entities (e.g., `**RESTRICTED TIER**`)
- No constraints, no DDL, no policy text — just shape and intent

Order entities by load-bearing-ness, not alphabetically. The entity that anchors the schema goes first.

### `## RLS posture`
- Trust tiers in scope (default / restricted, or whatever model)
- Named helper functions (`is_authenticated_user()`, `is_restricted_role()`)
- The policy-locality rule: policies live in the same migration as the table they protect
- A short example of one policy as illustration — NOT a full policy list

### `## Indexing strategy (initial)`
Bulleted list. Each index has:
- The columns it covers
- The query pattern it serves (one sentence per index)

Label the section "initial" — indexing IS revisable as load patterns emerge.

### `## Migration strategy`
The rules:
- One migration per change, never bundled
- RLS policies live in the same migration as the table they protect
- Destructive migrations (drops, renames, type changes) require explicit human approval
- Reference data and seed data flow through a separate `seed.sql` path, never inside a feature migration

### `## Open questions`
Numbered. Scoped to schema concerns: soft-delete, enum vs text columns, time-series shape, denormalization choices.

## Disciplines

1. **ER diagram first, then entity-by-entity.** Overview before detail.
2. **Restricted-tier inline.** Sensitivity is a property of the entity, declared where the entity is defined. Not in a separate appendix.
3. **Reasons accompany indexes.** Every index names the query pattern it serves. An index without a query justifying it is debt.
4. **RLS in the same migration as the table.** Security cannot be "we'll add it later."
5. **Inherit the taxonomy.** Refer Layer-1 and Layer-2 type lists to `domain-taxonomy.md` rather than duplicating them.
6. **No DDL.** This doc names entities and relationships. Migrations carry the SQL.
7. **Premature normalization is wrong.** Default to denormalized; split into child tables when a real query forces it.

## Anti-patterns to refuse

- Full CREATE TABLE statements in this doc. Belongs in migrations.
- Type-list duplication from the taxonomy doc. Point, don't restate.
- Security as a final section. Security is inline per entity.
- Indexes without justification.
- A "future schema" section. Keep the doc focused on v1.
- Catch-all `jsonb` for everything. Use real columns for fields you query on.

## Handoff

- **Reads from:** product-vision.md (trust tiers, constraints), domain-taxonomy.md (entity vocabulary)
- **Used by:** system-architecture.md (data flows, server actions), milestone-outline.md (which entities ship in which milestone), migrations (DDL)

## Output

- File: `docs/{project-slug}/data-model.md`
