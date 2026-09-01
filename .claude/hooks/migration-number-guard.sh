#!/usr/bin/env bash
# PreToolUse hook (Write): refuse to create a migration whose 4-digit version is
# already taken, anywhere.
#
# WHY THIS EXISTS. Two sessions can independently write the same
# `NNNN_*.sql` version. Two files sharing a version makes `supabase start` fail with a
# 23505 on `schema_migrations`, which turns EVERY `Tests (real DB)` and
# `E2E (Playwright)` job on EVERY branch red — not just the branch that added
# the second one.
#
# WHY A HOOK AND NOT COORDINATION. There is already a test
# (`tests/migration-versions.test.ts`) that catches duplicates, but only in CI,
# after the file is committed and pushed — by which point every other branch is
# already broken. And the human/agent protocol we were using that day was a
# ledger held in one session's head: it was correct, it was shared on request,
# and then that session exited and its knowledge went with it. The next session
# arrived an hour later asking the same question from scratch.
#
# A guard that reads git is not a protocol. It needs no coordinator, survives
# any session ending, and answers the same way for everyone.
#
# WHAT IT CHECKS. Every remote branch, not just origin/main: a number claimed on
# an open PR branch is claimed. That is exactly the case main-only checking
# misses, and exactly the case that bites: the number was on a branch, not yet
# merged, when the second session picked it.
#
# It is deliberately NOT a lock. It says "taken, here is the next free one" and
# gets out of the way. Re-writing an existing migration file (same path) is
# always allowed — editing your own migration is normal work.
set -u

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

payload="$(cat)"

# The path being written. `jq -r` yields "null" for absent keys, which simply
# fails the pattern match below.
path="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
[ -n "$path" ] || exit 0

# Only guard new migrations.
case "$path" in
  *supabase/migrations/*) ;;
  *) exit 0 ;;
esac

base="$(basename "$path")"
version="$(printf '%s' "$base" | sed -nE 's/^([0-9]{4})_.*\.sql$/\1/p')"
[ -n "$version" ] || exit 0

# Editing a file that already exists is not claiming a number.
[ -f "$path" ] && exit 0

# Every migration filename known to any remote branch, plus the working tree.
# `git ls-tree` per-branch is O(branches) but the repo has tens, not thousands,
# and this runs once per migration written.
existing="$(
  {
    for ref in $(git for-each-ref --format='%(refname)' refs/remotes 2>/dev/null); do
      git ls-tree --name-only "$ref" supabase/migrations/ 2>/dev/null
    done
    ls supabase/migrations/ 2>/dev/null | sed 's|^|supabase/migrations/|'
  } | sed 's|.*/||' | grep -E '^[0-9]{4}_.*\.sql$' | sort -u
)"

taken="$(printf '%s\n' "$existing" | grep -E "^${version}_" | head -3)"

if [ -n "$taken" ]; then
  # Next free number: one past the highest known, so the suggestion is never a
  # number someone else is already sitting on.
  highest="$(printf '%s\n' "$existing" | sed -nE 's/^([0-9]{4})_.*/\1/p' | sort -n | tail -1)"
  next="$(printf '%04d' $((10#${highest:-0} + 1)))"

  reason="Migration version ${version} is already taken:
$(printf '%s\n' "$taken" | sed 's/^/  /')

Two files sharing a version makes \`supabase start\` fail with a 23505 on
schema_migrations, which turns every real-DB and E2E job on EVERY branch red —
not just this one.

Next free version: ${next}

Checked every remote branch, not just origin/main: a number claimed on an open
PR branch is claimed, and that is the case main-only checking misses."

  jq -cn --arg r "$reason" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $r
    }
  }'
  exit 0
fi

exit 0
