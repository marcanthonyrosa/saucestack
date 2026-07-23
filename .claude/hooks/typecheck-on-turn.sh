#!/usr/bin/env bash
# Stop hook: run the project typecheck ONCE at turn end — and only when the turn
# actually touched TypeScript/JavaScript.
#
# Retro lesson: the old `pnpm typecheck` PostToolUse hook re-ran `tsc --noEmit`
# over the WHOLE project after EVERY Edit/Write. A turn that edits five files
# paid for five full-project typechecks back-to-back, and even doc-only turns
# paid nothing useful. That is the opposite of "run only what you act on".
#
# This runs at most one typecheck per turn, and skips silently on turns that
# changed no code. It stays informational (never blocks the stop) — the exit is
# always 0 — matching the old hook's non-blocking behaviour; type errors surface
# in the transcript for the next turn to fix.
set -u

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

# Nothing to check if this isn't a JS/TS project.
[ -f package.json ] || exit 0

# Did the working tree gain any changed/untracked JS/TS this turn? If not, skip.
if ! git status --porcelain 2>/dev/null | grep -qiE '\.(ts|tsx|js|jsx|mjs|cjs)$'; then
  exit 0
fi

pnpm typecheck 2>&1 | tail -20
exit 0
