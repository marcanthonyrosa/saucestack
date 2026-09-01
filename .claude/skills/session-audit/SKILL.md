---
name: session-audit
description: Measure how much of a session's human input was actual instruction versus babysitting — pure "go", "what's next?", and corrections of state the agent reported without checking. Turns a vague "it stops too often" into a number and a named cause. Triggers on "audit this session", "why do I keep saying go", "how much am I babysitting", "/session-audit".
---

# session-audit — count the friction before you redesign for it

`compound-learning` sharpens the project. `saucestack-feedback` sharpens the
starter. Neither tells you **whether the loop is actually working**. This does.

It exists because a real complaint — *"50% of the time it stops to ask for a
'Go' when there's no realistic alternative"* — sat unfixed as a vague annoyance
until someone counted. Counted, it took one pass to find the cause and the fix:
the agent was not being cautious, it was obeying four lines of config that said
to stop.

## 1. Extract the human's messages

From the session transcript (`~/.claude*/projects/<slug>/<session-id>.jsonl`):

```bash
python3 - <<'PY'
import json, sys
msgs = []
for line in open(sys.argv[1]):
    try: d = json.loads(line)
    except: continue
    if d.get("type") != "user": continue
    c = d.get("message", {}).get("content")
    t = (" ".join(x.get("text","") for x in c if isinstance(x, dict) and x.get("type")=="text")
         if isinstance(c, list) else (c if isinstance(c, str) else "")).strip()
    if not t: continue
    # Drop everything the human did not type.
    if t.startswith(("<system-reminder", "<task-notification", "<bash-input",
                     "<bash-stdout", "<command-name", "Caveat:",
                     "Another Claude session sent a message:",
                     "This session is being continued")): continue
    msgs.append(" ".join(t.split()))
print(len(msgs))
for i, m in enumerate(msgs, 1): print(f"{i:3d}. {m[:110]}")
PY
```

Filter hard. Tool results, peer messages, task notifications and compaction
summaries are not human input, and counting them buries the signal.

## 2. Classify every message into exactly one bucket

| Bucket | What it looks like | What it means |
| --- | --- | --- |
| **New instruction** | a task, a question, a decision, a correction of substance | the work you actually wanted |
| **Pure continue** | "go", "proceed", "yes", "do it", "keep going" | a gate that could not reject |
| **What's next?** | "what now", "anything else" | a turn ended without a next action |
| **Stale-state correction** | "I don't see that PR", "that's already merged" | the agent reported something it had not verified |
| **Structural** | merge notifications, sign-in confirmations | inherent to the workflow's design, not waste |

Be honest about the last row. If PRs are the approval gate, "#123 merged" is the
gate working, not friction. Do not inflate the number by counting it.

## 3. Report the ratio and, for each wasted message, the line that caused it

The ratio alone changes nothing. **Every "pure continue" should be traceable to
a specific instruction in `CLAUDE.md`, `AGENTS.md`, or a skill** — quote the
line. If you cannot find one, the cause is the model's judgment and the fix is a
rule; if you can, the cause is config and the fix is an edit.

Watch for the strongest signal there is: **the human saying "stop asking" and
the agent asking again afterwards.** That is proof config outranks a sentence in
the chat, and it means the fix belongs in the files.

## 4. Propose changes ranked by the count each would remove

Not by how interesting the fix is. A rule that removes seven messages beats a
clever gate refinement that removes one.

State the cost honestly. Removing a checkpoint means sometimes reading a result
you would have redirected — affordable when each phase is its own commit, less
so when it is not.

## 5. Hand back one next action

Open the PR against whichever file the count implicated, and route anything
generalizable to `saucestack-feedback` so the next project starts without the
friction this one measured.
