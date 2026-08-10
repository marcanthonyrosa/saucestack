#!/usr/bin/env bash
# PreToolUse guard: block `git push` to a branch whose PR has ALREADY MERGED.
#
# Retro lesson (tmc-intelligence, 2026-08-10): a fix was pushed to a feature
# branch ~1 minute after that branch's PR merged. The push succeeded, GitHub
# showed nothing wrong, and the commit was simply never on main — silently
# orphaned. It was only noticed because a human asked "did code get stacked into
# that merged PR?". The follow-up work had to be cherry-picked onto a fresh
# branch and re-reviewed.
#
# This is a recurring shape, not a one-off: the same project's notes record it
# biting on #401, #321, #364-367 and #289-293. Once a PR merges, its branch is
# dead — further commits belong on a new branch off the updated main.
#
# FAILS OPEN. If `gh` is missing, unauthenticated, or offline, this warns and
# allows the push: blocking every push because a network call failed would be a
# worse failure than the one it guards against.

input="$(cat)"

# Fast path: only inspect git push; everything else passes untouched.
case "$input" in
  *"git push"*) ;;
  *) exit 0 ;;
esac

cmd="$(printf '%s' "$input" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null || true)"
case "$cmd" in
  *"git push"*) ;;
  *) exit 0 ;;
esac

# Explicit opt-out, matching pr-base-guard's convention.
case "$cmd" in
  *"# allow-merged-push"*) exit 0 ;;
esac

command -v gh >/dev/null 2>&1 || exit 0

# Branch under push: an explicit refspec wins, else the current branch. Handles
# `git push -u origin foo`, `git push origin foo`, and bare `git push`.
branch="$(printf '%s' "$cmd" \
  | sed -nE 's/.*git push[[:space:]]+(-[^[:space:]]+[[:space:]]+)*[^[:space:]]+[[:space:]]+([^[:space:]:]+).*/\2/p')"
if [ -z "$branch" ]; then
  branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
fi
[ -n "$branch" ] || exit 0

case "$branch" in
  main|master|HEAD) exit 0 ;;  # other guards own those
esac

merged="$(gh pr list --head "$branch" --state merged --limit 1 --json number,mergedAt \
  --jq '.[0] | select(.number) | "#\(.number) merged \(.mergedAt)"' 2>/dev/null || true)"

if [ -n "$merged" ]; then
  cat >&2 <<MSG
merged-branch-guard: refusing to push to '$branch' — its PR is already merged ($merged).

Commits pushed to an already-merged branch are ORPHANED: they never reach main,
and nothing surfaces the mistake.

Do this instead:
    git fetch origin
    git checkout -b <new-branch> origin/main
    git cherry-pick <your-commits>
    git push -u origin <new-branch>

To override (e.g. pushing tags or a deliberate archive), append
'# allow-merged-push' to the command.
MSG
  exit 2
fi
exit 0
