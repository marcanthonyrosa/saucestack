---
name: saucestack-feedback
description: Send a generalizable learning from THIS project back to the saucestack starter as a PR (or an issue for discussion). The upstream counterpart to compound-learning — compound-learning sharpens this project; saucestack-feedback sharpens the starter so every future project inherits it. Triggers on "saucestack feedback", "upstream this to the starter", "iterate saucestack", "/saucestack-feedback".
---

# saucestack-feedback — close the compounding loop

`compound-learning` improves **this** project. This skill improves the **starter** — so the next project born from saucestack starts sharper. Use it whenever a lesson you just learned is *generalizable* (not specific to this product's domain).

## Provenance
Read `.claude/starter.json` for the target starter:
```json
{ "starter": { "name": "saucestack", "repo": "marcanthonyrosa/saucestack", "localPath": "/…/saucestack", "bootstrappedFrom": "v0.1" } }
```
If it's missing, ask for the starter repo (`owner/name`) and proceed with an issue.

## Workflow

### 1. Gather candidates
Collect the learnings worth upstreaming — from this session's `compound-learning` outputs, `.claude/learnings.jsonl` entries, or a lesson the user describes.

### 2. Classify: generalizable vs project-specific
For each candidate:
- **Project-specific** (this product's domain, data model, copy) → **skip.** That's `compound-learning`'s job; it stays local.
- **Generalizable** (a TDD-loop refinement, a reviewer improvement, a better hook/gate, a workflow fix, a doc clarification) → **upstream it.**

Be strict. The starter earns its keep by staying lean; only send what a *different* project, in a different domain, would also want.

### 3. Choose the vehicle: PR or issue
- **PR** — the change is concrete and you can make the edit: you have `localPath`, or push access to `repo`. Prefer this.
- **Issue** — the change needs discussion first, is a proposal not yet a concrete edit, or you lack write access.

### 4a. Open a PR (concrete change)
Against the starter repo (via `localPath`, or `gh repo clone <repo>` into a temp dir):
1. Branch: `field/<short-slug>`.
2. Make the edit to the actual agent/skill/hook/doc.
3. Commit (conventional): `feat(<area>): <lesson> — from <project>`.
4. `gh pr create --repo <repo> --base main` with the **PR template** filled: what changed, the friction that motivated it (name the project + the concrete moment), why it generalizes, and that it keeps the starter lean.
5. **Stop. A human reviews and merges.** Never auto-merge — the starter's own `pr-base-guard` + no-auto-merge apply.

### 4b. Open an issue (proposal)
`gh issue create --repo <repo> --label field-learning` using the **field-learning** issue template: the lesson, the real moment it came from, the proposed change, and why it generalizes.

### 5. Record it
Append to `.claude/starter-feedback.log` (project-local) so the same lesson isn't proposed twice. One line: date, vehicle (PR/issue) + url, one-line summary.

## Rules
- **Generalizable only.** When in doubt, it's project-specific — leave it to `compound-learning`.
- **Cite the real friction.** "From `<project>`: `<the concrete moment>`." A learning without a story is a guess.
- **Prefer enforcement.** If it can be a hook/gate, propose that, not prose.
- **Keep the starter lean.** A PR that adds bulk the next project won't use gets refused. Prune-if-default.
- **Human-gated.** You open the PR/issue; a human merges. Never push to the starter's `main`.
- **External contributors:** if you don't own the repo, fork it and PR from the fork (see the starter's `CONTRIBUTING.md`).
