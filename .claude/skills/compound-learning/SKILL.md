---
name: compound-learning
description: Phase 6 — turn agent mistakes and production incidents into permanent improvements. Triggers on "compound", "save lesson", "post-mortem", or after a fix lands. Drafts CLAUDE.md/AGENTS.md additions, regression tests, and new skills when warranted.
---

# Compound Learning — The Feedback Loop

Without this skill, the starter is static. With it, the starter gets sharper every week. Cherny's pattern: every agent mistake → fix + test + one-line CLAUDE.md addition. Every prod incident → permanent regression test.

**Capture ≠ retrieval ≠ enforcement.** A lesson only counts when something *loads it at the right moment* or *refuses to let you violate it*. Prefer the strongest available artifact: a hook/gate that makes the mistake impossible → a JIT-injected learning re-read every session → prose the agent might skip.

## Triggers

Invoke this skill after:
- A code review found a Critical that pattern-matched to something the agent should have known
- A prod incident (real users hit a bug)
- A repeated agent mistake (same wrong move on a second feature)
- A discovered missing context the agent kept asking for

## Workflow

### 1. Diagnose

Ask:
- **What went wrong?** One sentence.
- **What was the root cause?** Not the symptom — the cause.
- **What rule or workflow would have prevented this?** Be specific.

### 2. Decide the artifact shape

Three options. Pick one (sometimes two):

**A. CLAUDE.md or AGENTS.md addition** — when the lesson is a rule the agent should always follow.
- One line.
- Positive form. "Use X" not "don't use Y."
- Prune-if-default: if Claude already does this right, don't add it.
- Slot it into the existing structure; don't append a new section.

**B. Regression test** — when the lesson is a specific bug.
- Add via `regression-test-author` subagent.
- Test stays permanently.
- Bug logged in `tests/REGRESSIONS.md`.

**C. New skill or hook** — when the lesson is a workflow or a mechanically-checkable rule.
- A skill goes in `.claude/skills/{name}/SKILL.md` with triggers so the agent self-invokes next time. Examples: "post-migration-check," "rls-policy-verify."
- A **hook** goes in `.claude/hooks/` + `settings.json` when the rule can be *enforced* (a forbidden command, a required base branch, a missing policy). A hook can't be ignored; a rule can.

**D. Learnings-store entry** — when the lesson is a durable heuristic that must be *re-read every session* but doesn't fit a hook (a convention, a footgun, a preference the model won't guess). Append it:
```bash
.claude/hooks/learnings.sh log <type> <key> "<insight>" <confidence 1-10>
# type: pitfall | convention | preference | architecture
```
The `SessionStart` hook injects the top entries into context automatically — the fix for "lessons captured but never re-read."

**Prefer enforcement over prose.** If the lesson is mechanically checkable, make it a **hook or gate** (option C), not a rule the agent might ignore. Reserve A/D for what can't be enforced — conventions and judgment the model can't self-derive.

### 3. Apply the "shorter than the mistake" rule

The lesson written should be shorter than the mistake made. If your CLAUDE.md addition is longer than the buggy diff, you've over-generalized. Tighten or drop it.

### 4. Draft and apply

For option A, edit `CLAUDE.md` or `AGENTS.md`. Single-line addition. Commit:
```bash
git add CLAUDE.md AGENTS.md
git commit -m "docs(claude): {one-line lesson summary}"
```

For option B, invoke `regression-test-author`. Standard flow.

For option C, write the skill file, commit:
```bash
git add .claude/skills/{name}/SKILL.md
git commit -m "feat(claude): add {skill name} skill"
```

### 5. Prune the same week

If CLAUDE.md gained 3 lines this week, scan the whole file. Anything Claude already does right by default? Delete it. The goal is monotone usefulness, not monotone growth. The learnings store decays by confidence automatically; delete any entry that proved wrong.

## Examples

**Incident:** Agent created a Supabase table without an RLS policy.
**Already in CLAUDE.md:** "Enable RLS on every Supabase table; define policies in the same migration."
**Action:** No new rule needed (the rule existed). Instead, write a `rls-verify` skill that runs after every migration commit, greps for `enable row level security`, and confirms at least one `create policy` exists in the same file.

**Incident:** Agent over-mocked an integration test, making it pass against a stub of the function under test.
**New CLAUDE.md line:** "Integration tests run against a real local Supabase, never a mock of internal services."
**Plus regression test:** for the specific case, in `tests/regressions/`.

**Incident:** Agent kept asking which folder env vars belong in.
**Action:** Add to AGENTS.md: "Env vars live in `.env.local` (gitignored); parsed at startup in `lib/env.ts` via Zod." Future agents read it; question stops repeating.

## Rules

- One incident → at most one CLAUDE.md addition, one regression test, one skill. Don't pile on.
- Lesson is shorter than mistake. Otherwise prune.
- Re-read CLAUDE.md weekly and prune what Claude does right by default.
- If the same lesson would apply across tools, put it in AGENTS.md, not CLAUDE.md.
