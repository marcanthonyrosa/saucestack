# CLAUDE.md

> Imports `AGENTS.md` for cross-tool rules (Cursor, Codex, Claude Code share these).
> Pruned to under 100 lines on purpose. If you'd add a rule Claude already follows by default, don't.

## Mission

Build **{{PRODUCT_NAME}}** — {{one line: what it is, who it's for, why it exists}}. Solo-built, optimized for maintainability over cleverness.

> Replace the line above when you start a project. `/project-bootstrap` writes the full picture to `docs/{project-slug}/product-vision.md`; keep this a one-line summary.

**Data-sensitivity posture:** {{describe the data this product stores}}. Declare the posture here so the `compliance-reviewer` knows its default: if the product handles no regulated or sensitive data, it defaults to "no findings — out of scope"; if it handles PII / PHI / financial / secrets, name the regime here so the reviewer engages.

## Stack

Next.js 15 App Router · Supabase (Postgres + Auth + Storage) · Vercel · Resend · Tailwind · shadcn/ui · TypeScript strict · pnpm · Vitest · Playwright.

## Standing Rules (positive form)

- Use React Server Components by default; add `"use client"` only when interactivity demands it.
- Enable RLS on every Supabase table; define policies in the same migration as the table.
- Use the Supabase anon key on the client; the service-role key lives in server actions, route handlers, and scripts only.
- Use Zod schemas at every external boundary: server action input/output, route handlers, env, JSON.parse, Supabase results.
- Return `Result<T, E>` shapes from server actions; throw only for programmer errors.
- Co-locate tests with the file they test (`foo.ts` + `foo.test.ts`).
- One default export per file; named exports for utilities.
- Prefer Postgres views and materialized queries over application-layer joins.
- Prefer server actions over API routes for client mutations.
- Prefer Suspense + RSC streaming over client-side loading states.
- For sensitive or regulated fields (PII, PHI, financial, secrets): never in logs, URLs, error messages, or analytics.
- Push every commit to the feature branch's remote. Never `git push` to `main` or `master` — main updates only via PR. Never force-push.

## Workflow

The **project framework** runs once at project start: `/project-bootstrap` produces six docs in `docs/{project-slug}/` (vision, taxonomy, data-model, architecture, roadmap, milestone-1 outline). Every feature spec reads from there.

The **seven-phase loop** in `PLAN.md` runs per feature, downstream of the project framework. Subagents in `.claude/agents/` do specialized work. Skills in `.claude/skills/` orchestrate multi-agent flows. Slash commands in `.claude/commands/` are reusable entry points.

Phase gates require human approval — no auto-progression between phases.

## TDD Contract

Business logic is test-first. The `tdd-loop` skill enforces RED → automated `red-quality-gate` → GREEN → REFACTOR → commit, and runs autonomously — the gate proves each failing test is sound (fails for the right reason, actually exercises the target) so no human "go" is needed and false-greens don't slip through. The `tdd-guard` hook blocks Write/Edit on production files when no failing test exists in scope. If you find yourself wanting to modify a test to make it pass, stop and surface the conflict.

## Context Hygiene

- Use `/clear` between unrelated features. Never recycle a 4-hour session into a new feature.
- One concern per prompt. Split compound requests before submitting.
- Use Plan Mode for any non-trivial change. Show the plan before writing files.
- The four-file spec in `specs/{feature}/` is the source of truth for any feature, not the chat history.

## What to ask before acting

If a spec is ambiguous, ask one clarifying question. The Notion intern test: if a smart human intern with no context couldn't execute the prompt in plain English, it isn't ready.
