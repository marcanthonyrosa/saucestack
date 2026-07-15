---
name: system-architecture
description: Drafts the system-architecture doc — system context, stack, application structure, data flows, server-action surface, per-concern sections. Inherits governance rules from CLAUDE.md/AGENTS.md; defers code to the repo. Triggers on "design the system architecture", "draft the architecture", "/system-architecture". Distinct from /architecture-review which audits an existing design.
---

# System Architecture

Names how the system is physically put together. A reader should be able to answer "where does X live, what calls Y, what does Z plug into" in five minutes. NOT a place for code beyond interface signatures.

This skill produces `docs/{project-slug}/architecture.md`.

## When to use

- Vision, taxonomy, and data-model are drafted and approved.
- Before scoping the first milestone — milestone outlines name surfaces this doc declares.
- When the system has drifted from its design and onboarding requires reading code instead of docs.

## Workflow

1. **Read product-vision.md, domain-taxonomy.md, data-model.md, and the governance docs (CLAUDE.md / AGENTS.md).** Halt if vision or data-model is missing.
2. **Ask clarifying questions in ONE batch.** Cover:
   - Stack choices (framework, DB, hosting, mail, UI library, language, package manager) — confirm against governance doc
   - Integrated external systems (CRMs, payment, observability, AI vendors)
   - Egress points (publish paths, exports, webhooks) and how human-in-the-loop they are
   - Background-job needs (cron, queue, none)
   - Storage needs beyond Postgres (files, vectors, blobs)
   - Observability shape (logs only, traces, metrics, alerting target)
   - Deployment target and preview-environment policy
3. **Wait for answers.**
4. **Draft with the section structure below.**
5. **Halt.** Tell the user the draft is ready for review.

## Section structure

### `## System context`
A Mermaid `flowchart` diagram naming external inputs, integrated systems, the system itself (as a single box, not its internals), and end users. Followed by one paragraph that walks the boundary: what's inside, what's outside, what crosses.

This is the single most load-bearing diagram in the doc. Spend time on it.

### `## Stack`
A table. Layer | Choice | One-line reason. Reference the governance doc (CLAUDE.md / AGENTS.md) for operating rules — do not restate them here.

### `## Application structure`
An annotated directory tree (`tree -L 3` or similar) with one-line annotations next to each folder. Followed by the conventions that govern the layout:
- Default to RSC / server-rendered (or whatever the framework default should be)
- Client components only when interactivity demands it
- Server actions for mutations
- Suspense boundaries at the per-page level (or whatever)

State the conventions next to the layout they govern, not in a separate "rules" appendix.

### `## Data flow`
Sub-flows. Each sub-flow has a Mermaid diagram + one TypeScript interface signature per pluggable surface. Typical sub-flows:
- Ingestion (how raw data enters)
- Derivation (how interpretations are produced from raw data)
- Read paths (how a typical UI render fetches what it needs)
- Sync (how integrated systems push state in)
- Egress (publish, export, webhook)

One interface per pluggable surface (`interface SourceAdapter { ... }`). Just the signature, not the implementation.

### `## Server-action surface`
Concrete typed signatures grouped by route or feature area. Shows the shape, not the body.

### `## Route handlers`
When to use them instead of server actions. List 2-4 specific cases (webhooks, file uploads requiring streaming, third-party callbacks, public-cacheable endpoints).

### `## Per-concern sections`
One per concern that's load-bearing for this system. Common concerns:
- **LLM / AI integration** — model defaults table, prompt-management posture, eval framework
- **Auth / access** — auth provider, session shape, role mapping
- **Storage** — file storage strategy, vector store if any
- **Background jobs** — cron schedule table, job framework, retry posture
- **Observability** — logs, traces, alerting, dashboards
- **Testing topology** — table of layer / tool / scope (unit / integration / e2e / eval / regression)
- **Deployment** — branch model, preview environments, secret management

Use tables for matrices (model choices, cron schedules, test layers). Tables beat paragraphs for decisions.

### `## Open questions`
Numbered. Architecture-scoped uncertainties only.

## Disciplines

1. **System boundary first.** The "what's inside vs outside" diagram is the most load-bearing thing in the doc.
2. **Diagrams are minimal Mermaid.** Checked-in, diffable, no Figma exports.
3. **Interfaces over implementation.** One TS interface per pluggable surface is enough. No bodies.
4. **Convention next to layout.** "RSC by default" sits next to the directory tree it governs.
5. **Tables for decision matrices.** Glanceable beats narrative.
6. **Inherit governance.** "CLAUDE.md governs operating rules; this doc inherits all of them." Don't restate.
7. **One purpose per per-concern section.** Auth and storage are different concerns; don't conflate.

## Anti-patterns to refuse

- Function bodies or implementation code. Interfaces only.
- Re-declaring rules that live in the governance doc. Point, don't restate.
- Premature scaling sections (sharding, multi-region) for a system that hasn't shipped.
- "We use microservices because" architectural cosplay. Reality first.
- A code dump pretending to be architecture. If it's longer than 5 lines, it's code.
- Mixing in feature designs. Architecture is system-shape; features come later.

## Handoff

- **Reads from:** product-vision.md (constraints, stack), domain-taxonomy.md (what flows where), data-model.md (entities the flows touch), CLAUDE.md / AGENTS.md (operating rules)
- **Used by:** milestone-outline.md (which surfaces a milestone touches), feature specs (entry points and boundaries)
- **Defers to:** the repo (code), migrations (DDL), governance docs (rules)

## Output

- File: `docs/{project-slug}/architecture.md`
