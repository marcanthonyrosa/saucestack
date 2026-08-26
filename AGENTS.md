# AGENTS.md

> Cross-tool conventions for any AI coding agent operating in this repo: Claude Code, Cursor, Codex, OpenAI Operator, etc. Tool-specific behavior (subagent invocation, hook syntax) lives in `CLAUDE.md`. Universal rules live here.

## Project shape

- **Stack:** Next.js 15 App Router · TypeScript strict · Supabase · Tailwind · shadcn/ui · Vitest · Playwright · pnpm.
- **Architecture:** Monolith. Managed services over self-hosted. Solo-builder maintainability over cleverness.
- **The spec is the source of truth.** Per-feature specs live in `specs/{feature}/`. Architecture decisions live in `docs/decisions/`. Read the relevant spec before writing code.
- **A chosen design is part of the spec.** When a direction is selected — by whatever tool explored it — write `specs/{feature}/selection.md` with its composition ledger (where the cards are, what is master and what is detail, what is one object and what is two) before building. A picture and a chat message are not artifacts a diff can be reviewed against, and composition decisions have no acceptance criterion to hang from, so they are the ones that go missing while every AC passes.

## Coding rules (positive)

- React Server Components by default. `"use client"` only when interactivity demands it.
- Enable RLS on every Supabase table; policies live in the same migration as the table.
- Service-role key never reaches the client. Anon key + RLS for client-side data access.
- Zod at every external boundary: server action input/output, route handlers, env, `JSON.parse` results, Supabase return values.
- Server actions return `Result<T, E>` shapes; throw only for programmer errors.
- Co-locate tests with the file they test (`foo.ts` + `foo.test.ts`). Or `tests/integration/` and `tests/e2e/` for those tiers.
- One default export per file. Named exports for utilities.
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`, scoped where useful.
- Push every commit to the feature branch's remote. Never `git push` to `main` or `master` — main updates only via PR. Never force-push.
- **A merged PR closes its branch.** Once a PR is merged, stop pushing to that branch: further commits are *orphaned, not queued* — they sit on a dead branch and silently never ship. Re-branch from updated `main` and open a new PR. Before pushing to any branch you have already proposed, check it is still open (`gh pr view <n> --json state`). This bites hardest when a review conversation continues after the merge — the follow-up commits are exactly the ones the discussion decided were most important, and they are the ones that vanish.

## Testing rules

- Test-first for business logic.
- Tests assert behavior, not implementation. No mocking what you own — only the network boundary.
- No tautological assertions (`toBeDefined`, `toBeTruthy` on what was just set, mocks returning the call shape).
- Never modify a test to make it pass. Fix the code, or fix the test for the right reason, never both at once.
- Integration tests use a real local Supabase. RLS policies get their own tests.
- E2E tests target the Vercel preview URL, not localhost.

## Context hygiene

- Use Plan Mode for non-trivial changes. Show the plan, get approval, then act.
- One concern per prompt. Split compound asks.
- `/clear` (or your tool's equivalent) between unrelated features.
- The spec, not the chat history, is canonical. If the chat and the spec disagree, the spec wins.

## What "done" looks like

- Failing test existed, then passed.
- `pnpm typecheck` is clean.
- `pnpm test` is green.
- No new `any`, no `// @ts-ignore` without an issue link, no disabled lint rules.
- Atomic commit with a conventional message.

## What's prohibited

- Service-role key in client-reachable files.
- Hardcoded secrets, even temporarily.
- Disabling type checks, lint rules, or tests to ship.
- Inventing shadcn components that don't exist in `components/ui/`.
- Modifying tests to make implementation pass.
- Skipping plan mode on a "small" change.
