---
name: browser-qa
description: Drives a real browser to QA a feature the way a person would — navigate, click, fill, submit, observe — then fixes what's broken and pins a regression. Complements headless Playwright e2e with exploratory, human-like QA. Triggers on "browser qa", "qa this feature", "click through it", or before ship on any user-facing surface.
---

# Browser QA — real-browser, human-like exploratory testing

Headless e2e proves the paths you scripted. This proves the paths a *user* takes. Drive a real browser through the feature, find what's actually broken (visual, interaction, state), fix it, and pin a regression so it stays fixed.

Uses the `claude-in-chrome` MCP tools. If they're deferred, load the core set first in ONE call:
`ToolSearch "select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__read_console_messages"`

## Target URL
Prefer the **Vercel preview URL** for the branch (production-like). Fall back to local `pnpm dev` only if no preview exists. **Never QA against production.**

## Loop

### 0. Setup
- Confirm a clean working tree (commit or stash first — you'll be making fix commits).
- `tabs_context_mcp` to see current tabs; `tabs_create_mcp` for a fresh tab. Never reuse an unrelated tab.
- Read the feature's `03-user-journeys.md` — those are your primary scripts. Then go off-script.

### 1. Walk the journeys
For each journey: navigate and actually do it — click the buttons, fill forms with realistic *and* adversarial input (empty, too long, wrong type), submit, observe. Screenshot each meaningful state. Read the console (`read_console_messages`) for errors/warnings the UI hides.

### 2. Go off-script
Try what a real user does that the spec didn't: back button mid-flow, double-submit, reload on a populated form, deep-link to a sub-route, resize narrow. This is where the bugs live.

### 3. Triage by severity
- **Critical** — app-breaking: crash, 404, data loss, a flow that can't complete.
- **High** — a function is blocked: button doesn't work, form won't submit, error with no recovery.
- **Medium** — usability friction: unclear state, missing feedback, confusing copy.
- **Low** — cosmetic: spacing, alignment, contrast, a typo.

### 4. Fix → verify → pin
For each issue, worst-first:
- Fix it in source.
- Re-navigate to the same state, confirm the fix, screenshot **before/after**.
- Add a regression test (e2e for interaction, unit for logic) via `regression-test-author` so it can't silently come back.
- Atomic commit per fix: `fix(qa): {issue}`.

## Output
```markdown
# Browser QA — {feature} ({preview URL})

Health: {N critical, N high, N medium, N low}  →  after fixes: {…}

## {Severity}: {issue}
- Repro: {steps}
- Evidence: {before screenshot}
- Fix: {what changed} · {after screenshot}
- Regression: {test path}
```

## Rules
- **Real browser, preview URL** — not headless, not production.
- **Off-script is the point.** The spec's happy path is table stakes; find what it missed.
- **Every fix gets a regression.** A QA fix without a pin will regress.
- **Atomic commits.** One fix, one commit, with before/after evidence.
- **Don't trigger native dialogs** (`alert` / `confirm`) — they freeze the automation. Use `console.log` + `read_console_messages` instead.
