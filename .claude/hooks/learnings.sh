#!/usr/bin/env bash
# Minimal append-only project-learnings store with JIT retrieval + confidence decay.
# Plain JSONL, no vector DB. Fixes the retro finding: lessons captured but never re-read.
#
#   learnings.sh log <type> <key> <insight> [confidence 1-10]   # append a lesson
#   learnings.sh search                                         # print top 5 (human use)
#   learnings.sh preamble                                       # emit SessionStart additionalContext JSON
set -euo pipefail
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
FILE="$ROOT/.claude/learnings.jsonl"
cmd="${1:-search}"

case "$cmd" in
  log)
    python3 - "$FILE" "${2:?type}" "${3:?key}" "${4:?insight}" "${5:-7}" <<'PY'
import sys, json, os, datetime
file, type_, key, insight, conf = sys.argv[1:6]
os.makedirs(os.path.dirname(file), exist_ok=True)
rec = {"ts": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
       "type": type_, "key": key, "insight": insight, "confidence": int(conf)}
open(file, "a").write(json.dumps(rec) + "\n")
print(f"logged: [{type_}] {key}")
PY
    ;;
  search|preamble)
    [ -f "$FILE" ] || exit 0
    python3 - "$FILE" "$cmd" <<'PY'
import sys, json, datetime
file, mode = sys.argv[1], sys.argv[2]
now = datetime.datetime.utcnow()
rows = {}
for line in open(file):
    line = line.strip()
    if not line: continue
    try: r = json.loads(line)
    except Exception: continue
    rows[(r.get("type"), r.get("key"))] = r      # latest entry per key+type wins
def score(r):
    s = r.get("confidence", 5)
    try:
        age = (now - datetime.datetime.strptime(r["ts"], "%Y-%m-%dT%H:%M:%SZ")).days
        s -= age // 30                            # decay 1 per 30 days
    except Exception: pass
    return s
items = sorted(rows.values(), key=score, reverse=True)[:5]
if not items: sys.exit(0)
lines = "\n".join(f"- [{r.get('type')}] {r.get('key')}: {r.get('insight')}" for r in items)
if mode == "preamble":
    ctx = "Project learnings (top 5, auto-loaded — apply these before acting):\n" + lines
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": ctx}}))
else:
    print(lines)
PY
    ;;
  *) echo "usage: learnings.sh {log <type> <key> <insight> [conf] | search | preamble}" >&2; exit 1 ;;
esac
