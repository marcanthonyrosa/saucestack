# AGENTS.md

> Cross-tool conventions for any AI coding agent operating in this repo: Claude Code, Cursor, Codex, OpenAI Operator, etc. Tool-specific behavior (subagent invocation, hook syntax) lives in `CLAUDE.md`. Universal rules live here.

## Project shape

- **Stack:** Next.js 15 App Router · TypeScript strict · Supabase · Tailwind · shadcn/ui · Vitest · Playwright · pnpm.
- **Architecture:** Monolith. Managed services over self-hosted. Solo-builder maintainability over cleverness.
- **The spec is the source of truth.** Per-feature specs live in `specs/{feature}/`. Architecture decisions live in `docs/decisions/`. Read the relevant spec before writing code.
- **A chosen design is part of the spec.** When a direction is selected — by whatever tool explored it — write `specs/{feature}/selection.md` with its composition ledger (where the cards are, what is master and what is detail, what is one object and what is two) before building. A picture and a chat message are not artifacts a diff can be reviewed against, and composition decisions have no acceptance criterion to hang from, so they are the ones that go missing while every AC passes.

## Communication default

**Write for a reader with ADHD. This is the default, not a mode to be switched on.** The
full contract is `.claude/skills/i-have-adhd/SKILL.md`; the shape in brief:

- **Lead with the next action** — a command, path, or snippet on the first line. Not context, not a plan, not "Let me…".
- **Number multi-step work**, one bounded action per step, fewest steps that still work.
- **Restate state every turn** ("step 3 of 5 done; next: X"). The reader cannot hold it between messages.
- **One concrete next action at the end**, doable in under two minutes.
- **Specific time estimates** in concrete units. "Some work" and "an afternoon" read identically.
- **No preamble, no recap, no closing pleasantries.** Start with the answer; stop when it is done.
- **Suppress tangents.** Finish the first thing, then offer the second as its own question.
- **Make finished work visible** in concrete terms — what now works, and how to see it.
- **Matter-of-fact on errors**: cause and fix, never "Uh oh" or "There seems to be a problem."

This binds subagents too. A reviewer's findings and an architect's design reach the same
reader; a subagent returning a wall of prose undoes the default exactly where it matters.

It yields to the task, never the reverse: "explain this" gets a full explanation, "what are
my options" gets ranked options, and a destructive action still gets a confirmation. Shape
the answer — do not delete it.

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
- **A gated-off suite must be gated ON somewhere real.** `describe.skip` and env flags keep a not-yet-runnable suite from training people to ignore red CI — but if no workflow ever *sets* the flag, the suite is collected, skipped, reported green, and inert forever. Set it in a scheduled job, and read the skip count: "48 skipped" is not passing, it is absent.
- **Migration post-conditions assert size-independent invariants.** CI applies migrations to a FRESH, unseeded database, so `count(*) <> 10` — a number measured on production — raises there and takes `supabase start` down with it, killing every job that needed a database. Assert the rows you targeted, not the corpus.

## CI rules

- **The gate runs everything that needs no infrastructure — not a directory.** Tests are co-located here, so a required check pointed at `tests/unit` covers almost nothing by construction. Route specs by what each file actually reaches for: `.claude/templates/vitest.route.ts`.
- **Serialize only the tests that need it.** `fileParallelism: false` is a global switch; set for the few suites sharing one database, it silently taxes every pure test in the repo.
- **One trigger per commit.** `on: push` for all branches *plus* `on: pull_request` runs the whole matrix twice for every commit on an open PR. Always set `concurrency` with `cancel-in-progress`.
- **Never `paths-ignore` a required check.** The job must always run and always report; skip the expensive part in a *step*. A required check that never reports blocks the PR forever.
- **An advisory job is pure cost.** If it cannot block a merge, it cannot protect anything — make it required, move it off the PR path, or delete it. Same for a nightly nobody reads.
- Audit with `/ci-audit` when CI feels slow or expensive — and once after adopting the starter, since templates only reach *new* repos and every adopted one drifts.

## Working alongside other agents

Several sessions on one repo is now the normal case, not the exception. Two of
them cost a project most of an afternoon: two sessions claimed the same
migration version, and two independently fixed the same test.

- **Coordination state lives in the repo, not in a conversation.** A ledger held
  in one session's head is correct, shared on request, and gone the moment that
  session exits — the next one arrives an hour later asking the same questions.
  `.claude/FLEET.md` is a claim table: add a row before you write code, delete it
  when you finish. A stale claim is worse than no claim.
- **Never report another session's claim as fact.** A peer saying a PR is
  "merged", "green" or "waiting on the human" is a hypothesis about state, and it
  goes stale between their message and yours. `gh pr view <n> --json state,merged`
  is one call. Two user corrections in one session came from relaying peer PR
  status unread — both PRs were already merged.
- **Prefer a guard that reads git over a protocol people follow.**
  `.claude/hooks/migration-number-guard.sh` refuses a migration version already
  taken on ANY remote branch, because a number claimed on an unmerged branch is
  claimed and `git ls-tree origin/main` cannot see it. A guard needs no
  coordinator and survives any session ending.
- **Permission boundaries are per-session.** Never ask a peer to run something
  your own settings blocked, and refuse if asked. That launders exactly the
  decision the block exists to force.

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
