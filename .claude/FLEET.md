# FLEET.md — who is working on what

Read this before you start. Add your row before you write code. Delete your row
when you finish.

This file exists because several agent sessions on one repo is now the normal
case, and the collisions are specific and repeatable:

- **Two sessions write the same migration version.** Two files sharing a version
  makes `supabase start` fail on `schema_migrations`, which turns every job that
  needs a database red on **every** branch — not just the offender's.
- **Two sessions independently fix the same test**, landing near-identical PRs an
  hour apart. No harm, pure waste.
- **A session starts from a branch point hours old** and builds on a module that
  has since gained columns and invariants.

None of that is carelessness. The usual coordination is a ledger held in one
session's head: correct, shared on request, and gone the moment that session
exits. The next session arrives later asking the same questions from scratch.

**So the rule is: coordination state lives in the repo, not in a conversation.**
A file survives a session ending. A teammate does not.

---

## Claimed now

| Session | Branch | Surfaces | Migration | Since |
| --- | --- | --- | --- | --- |
| _(none)_ | | | | |

**Migration column:** the exact version you intend to write (`0042`), or `—`.
Claiming a number here is advisory; the real guard is
`.claude/hooks/migration-number-guard.sh`, which refuses a version already
present on any remote branch and names the next free one. Trust the hook over
this table — the hook reads git, the table reads whatever someone last typed.

**Surfaces:** the paths you will EDIT, not the ones you will read. Globs are
fine (`lib/billing/**`). Overlap is not forbidden — it is a conversation. If
your surfaces overlap a claimed row, message that session before you write.

---

## Before you start

1. `git fetch && git log --oneline -1 origin/main` — if your branch point is
   more than a couple of hours old, rebase.
2. Add your row above.
3. Check the migration guard's answer, not your memory, for the next free
   number.

## Before you open a PR

- **Read the actual CI result, not the merge button.** `gh pr checks <n>` is the
  truth, and only a REQUIRED check blocks anything.
- **Check WHEN a job runs, not just whether it is required.** A suite that runs
  only on `push` cannot gate the PR that breaks it — no required check will ever
  catch it, by construction.
- If a job fails on a file you did not touch, check whether `main` is already
  red before assuming it is yours.

## When you finish

Delete your row. A stale claim is worse than no claim: the next session either
trusts it and waits for nobody, or learns to ignore the file.
