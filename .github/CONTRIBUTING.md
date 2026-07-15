# Contributing to saucestack

saucestack is a **starter** — a playbook every new project inherits. That framing decides what belongs here.

## The one rule: generalizable only

A change belongs in saucestack if a *different* project, in a different domain, would also want it. Anything specific to one product's domain, data model, or copy belongs in *that* project's `CLAUDE.md` (via its `compound-learning`), not here.

Before proposing a change, ask:
- Would the next project born from this starter benefit, unchanged?
- Does it keep the starter **lean**? (Prune-if-default: if Claude already does it right, don't add it.)
- Can it be **enforced** (a hook/gate) rather than merely stated (prose the agent may skip)? Prefer enforcement.

## Issue or PR?

- **Open an issue** to propose or discuss an idea, or report a bug. Use the **field-learning** template when the idea came from real project use — that's the most valuable kind.
- **Open a PR** when you have a concrete, ready change. Fill the PR template: what changed, the real friction that motivated it, and why it generalizes.

## The field-learning loop (dogfooding)

The best improvements come from *using* saucestack on a real project and hitting friction. If you bootstrapped a project from saucestack, the **`/saucestack-feedback`** skill drafts a PR or issue back here for you — classify the lesson as generalizable, and it opens the PR with the story attached.

## External contributors

You won't have push access. Standard flow:
1. **Fork** the repo.
2. Branch from `main`: `field/<slug>` or `fix/<slug>`.
3. Make the change; keep it focused and lean.
4. Open a PR from your fork against `main`, with the PR template filled.

## Review bar

- PRs target `main`. A maintainer reviews and merges — **no auto-merge**.
- Keep changes atomic. One lesson, one PR.
- Markdown agents/skills/hooks are the surface area; there's no build step.

## Local setup

Clone, open in Claude Code, and the agents/skills/commands/hooks are live. `tdd-guard` and `hallmark` install via their own installers (see the README).
