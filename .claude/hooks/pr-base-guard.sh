#!/usr/bin/env bash
# PreToolUse guard: block `gh pr create` whose base isn't main, unless an explicit stacked PR.
# Retro lesson: PRs silently targeting a feature branch never reached prod. Merge should = deploy to prod.
input="$(cat)"

# Fast path: only inspect gh pr create commands; everything else passes untouched.
case "$input" in
  *"gh pr create"*) ;;
  *) exit 0 ;;
esac

cmd="$(printf '%s' "$input" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null || true)"

# Explicit opt-in for an intentional stacked PR.
case "$cmd" in
  *"# stacked"*) exit 0 ;;
esac

base="$(printf '%s' "$cmd" | sed -nE 's/.*(--base|-B)[= ]+([^ ]+).*/\2/p')"

if [ -n "$base" ] && [ "$base" != "main" ] && [ "$base" != "master" ]; then
  echo "pr-base-guard: refusing 'gh pr create --base $base'. A PR into a feature branch will NOT deploy to production — merges should target main. If this is an intentional stacked PR, append '# stacked' to the command to override." >&2
  exit 2
fi
exit 0
