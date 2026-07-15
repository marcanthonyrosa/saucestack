# saucestack — a spec-driven, TDD-enforced Claude Code starter

Spec-driven development scaffolding for Claude Code, opinionated for a Next.js 15 · Supabase · Vercel · Tailwind · shadcn/ui stack. Bring your product; the playbook brings the process — vision → spec → architecture → TDD build → review → ship → compound.

Synthesis of the May 2026 consensus from Claire Vo (Lenny's Newsletter), Boris Cherny (Anthropic), Ryan Nystrom (Notion), Kent Beck, Hamel Husain & Shreya Shankar (evals), Eugene Yan, Lazar Jovanovic (four-PRD pattern), Geoffrey Huntley, Andrej Karpathy, and the GitHub Spec Kit lineage.

## What saucestack adds

Beyond a spec-driven, TDD-enforced core, saucestack bakes in lessons from shipping a real product on this playbook — the parts a vanilla starter misses:

- **Autonomous TDD with a RED-quality gate** — the `red-quality-gate` agent proves each failing test is sound (fails for the right reason, would not pass against a trivial implementation) and *replaces* the human "go", so the loop runs unsupervised without admitting false-greens.
- **Design ownership** — a `style-guide-steward` (owns a living style guide), a `pattern-conformance-reviewer` (enforces explicit *and* implied UI patterns — the 8th reviewer), the `/hallmark` anti-AI-slop skill (from Nutlope, installed via `npx skills add nutlope/hallmark`), and multi-variant HTML prototyping.
- **Live browser QA** — the `browser-qa` skill drives a real browser (Chrome MCP) for exploratory QA beyond headless e2e.
- **Learnings that get re-read** — an append-only `learnings.jsonl` + a SessionStart hook that injects the top lessons into every session. Capture ≠ retrieval; this fixes it.
- **Compounding across projects** — `/saucestack-feedback` sends *generalizable* learnings from any project born of saucestack back here as a PR (or issue), so the starter sharpens every time it's used.
- **Enforcement over prose** — mechanically-checkable rules are hooks/gates, not prompts: `pr-base-guard` (a merge should = deploy to prod), a destructive-action deny-list, push-to-main protection.
- **Spec reconcile-back** — the spec-compliance reviewer folds intentional drift back into the spec and alarms only on *silent* drift.

## The spec-driven + TDD core

- **Four-file spec pattern** (`00-master-plan`, `01-implementation-plan`, `02-design-guidelines`, `03-user-journeys`) — Lazar Jovanovic / Claire Vo
- **ADRs** in `docs/decisions/` — permanent institutional memory separate from feature specs
- **`tdd-guard` PreToolUse hook** — physically blocks Write/Edit when no failing test is scoped
- **`plan.md` test ledger** — Kent Beck-style behavior list, not task list
- **`AGENTS.md`** — cross-tool standard for Claude Code AND Cursor AND Codex
- **`ship-pr` skill** — orchestrated pre-merge checks, opens PR, never merges
- **Phase 6: Compound learnings** — every mistake → a hook/gate, a JIT learning, a regression test, or a one-line rule
- **Eight parallel reviewers** — security, compliance, type-safety, performance, accessibility, spec-compliance, pattern-conformance, test-quality
- **CLAUDE.md pruned** to < 100 lines, positive-form rules only (Karpathy / Cherny)
- **Named eval tooling** — Promptfoo / Braintrust / Inspect AI — with κ ≥ 0.6 judge-human calibration
- **Worktree parallelism** elevated to first-class pattern in the build phase
- **`/clear` hygiene rule** between features

## What's in the box

```
.
├── PLAN.md                              ← the seven-phase loop (the playbook)
├── CLAUDE.md                            ← project constitution, <100 lines, positive form
├── AGENTS.md                            ← cross-tool standard (Cursor/Codex/Claude Code)
├── docs/
│   └── decisions/                       ← Architecture Decision Records, permanent
├── reviews/                             ← code review outputs (gitignored)
├── .github/                             ← CONTRIBUTING + issue/PR templates (contributing to saucestack)
└── .claude/
    ├── settings.json                    ← hooks (tdd-guard, pr-base-guard, learnings, typecheck) + permissions
    ├── agents/                          ← 22 specialized subagents
    │   ├── pm-spec-author.md            ← Phase 0: four-file spec
    │   ├── architect.md                 ← Phase 1: design + ADRs (has adversarial mode)
    │   ├── ux-prototyper.md             ← Phase 2: multi-variant HTML prototypes
    │   ├── style-guide-steward.md       ← owns the living style guide
    │   ├── task-planner.md              ← Phase 3: plan.md test ledger
    │   ├── tdd-test-writer.md           ← Phase 4: RED (stops for the gate)
    │   ├── red-quality-gate.md          ← Phase 4: proves the RED is sound (replaces human "go")
    │   ├── tdd-implementer.md           ← Phase 4: GREEN
    │   ├── tdd-refactor.md              ← Phase 4: REFACTOR
    │   ├── unit-test-author.md          ← test tier specialist
    │   ├── integration-test-author.md   ← test tier specialist (RLS testing)
    │   ├── e2e-test-author.md           ← test tier specialist (Playwright)
    │   ├── regression-test-author.md    ← bug reproduction (permanent)
    │   ├── security-reviewer.md         ← Phase 5: review
    │   ├── compliance-reviewer.md       ← Phase 5: review (data-sensitivity; default out-of-scope)
    │   ├── type-safety-reviewer.md      ← Phase 5: review (anti-pattern grep)
    │   ├── performance-reviewer.md      ← Phase 5: review
    │   ├── accessibility-reviewer.md    ← Phase 5: review
    │   ├── spec-compliance-reviewer.md  ← Phase 5: review (AC traceability + reconcile-back)
    │   ├── pattern-conformance-reviewer.md ← Phase 5: review (explicit + implied UI patterns)
    │   ├── test-quality-reviewer.md     ← Phase 5: review (tautologies, mock-shape)
    │   └── eval-author.md               ← Phase 7: AI evals (κ ≥ 0.6)
    ├── skills/                          ← 14 skills (+ hallmark, installed separately)
    │   ├── project-bootstrap/SKILL.md   ← project framework orchestrator
    │   ├── product-vision/SKILL.md      ← project framework: vision doc
    │   ├── domain-taxonomy/SKILL.md     ← project framework: shared vocabulary
    │   ├── data-model/SKILL.md          ← project framework: entities + RLS
    │   ├── system-architecture/SKILL.md ← project framework: system shape
    │   ├── product-roadmap/SKILL.md     ← project framework: milestone sequencing
    │   ├── milestone-outline/SKILL.md   ← project framework: per-milestone scope
    │   ├── tdd-loop/SKILL.md            ← RED → red-quality-gate → GREEN → REFACTOR
    │   ├── full-review/SKILL.md         ← 8 parallel reviewers
    │   ├── browser-qa/SKILL.md          ← real-browser exploratory QA (Chrome MCP)
    │   ├── ship-pr/SKILL.md             ← pre-merge orchestration
    │   ├── architecture-review/SKILL.md ← two-pass feature design + adversarial
    │   ├── compound-learning/SKILL.md   ← Phase 6: sharpen THIS project
    │   └── saucestack-feedback/SKILL.md ← upstream generalizable learnings to the starter
    ├── commands/
    │   ├── review.md                    ← /review
    │   ├── ship-pr.md                   ← /ship-pr
    │   ├── compound.md                  ← /compound
    │   └── saucestack-feedback.md       ← /saucestack-feedback
    ├── hooks/
    │   ├── pr-base-guard.sh             ← block PRs against a non-main base
    │   └── learnings.sh                 ← append-only learnings store + JIT retrieval
    ├── learnings.jsonl                  ← project lessons (auto-injected at session start)
    └── starter.json                     ← provenance (powers /saucestack-feedback)
```

## Install

```bash
# From the root of your repo:
git clone https://github.com/marcanthonyrosa/saucestack.git ../saucestack
cp -r ../saucestack/.claude .
cp ../saucestack/CLAUDE.md ../saucestack/AGENTS.md ../saucestack/PLAN.md .

# Create working folders
mkdir -p specs docs/decisions reviews evals

# Record where this project came from (powers /saucestack-feedback)
cat > .claude/starter.json <<'EOF'
{ "starter": { "name": "saucestack", "repo": "marcanthonyrosa/saucestack", "bootstrappedFrom": "v0.1" } }
EOF

# Install tdd-guard (the PreToolUse hook depends on it)
pnpm dlx tdd-guard@latest install

# Install the hallmark design skill — anti-AI-slop; re-run any time to update
npx skills add nutlope/hallmark

# Gitignore the ephemeral working state
cat >> .gitignore <<'EOF'

# Spec-driven dev working state
specs/*/plan.md
specs/*/design-review.md
reviews/
.env.local
.env
EOF

# Optional: GitHub Spec Kit for /constitution /specify /plan /tasks /implement slash commands
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init . --integration claude
```

Open Claude Code in the repo. The agents, skills, commands, and `tdd-guard` are now active.

## First-time project bootstrap (one-time per project)

The starter assumes the **project-level docs** live in `docs/{project-slug}/`. These docs feed every feature spec — `pm-spec-author` reads from there in Phase 0. Run the framework once before any feature work begins.

```
1. /clear or fresh Claude Code session.
2. /project-bootstrap
   → Asks for a project slug (e.g., "my-app").
   → Walks the six docs in dependency order with human gates between each:
       a. /product-vision        → docs/{slug}/product-vision.md
       b. /domain-taxonomy       → docs/{slug}/domain-taxonomy.md   (skip for pure transaction systems)
       c. /data-model            → docs/{slug}/data-model.md
       d. /system-architecture   → docs/{slug}/architecture.md
       e. /product-roadmap       → docs/{slug}/roadmap.md
       f. /milestone-outline     → docs/{slug}/milestone-1-outline.md
3. Review each doc as it's drafted. Vision must be approved before taxonomy starts, etc.
4. When all six are approved, the project is ready for feature work.
```

You can also invoke any per-doc skill independently later (e.g., `/milestone-outline` for milestone 2 after M1 ships). The orchestrator is for the from-scratch run.

**Disciplines enforced** (Claire-Vo influence): JTBD with canonical loss stories · explicit non-goals at every level · falsifiable success · structural wedge for "why now" · deferred-decision discipline · doc-to-doc handoffs · open questions with owners.

See `PLAN.md` § "Project framework" for the full discipline checklist.

## First feature, end to end

```
0. brief.md at repo root (your sketch, no AI).
1. /clear or fresh Claude Code session.
2. "Use pm-spec-author to draft the four-file spec from brief.md."
   → Answer clarifying questions. Review specs/{feature}/00-03.md.
3. /clear.
4. "Run the architecture-review skill on this feature."
   → Architect designs + ADRs. Adversarial pass in fresh context.
   Review specs/{feature}/design.md and docs/decisions/.
5. (For anything substantially new) /clear, "Use ux-prototyper" — 2–3 variants + comparison; run /hallmark on the leader.
6. /clear, "Use task-planner."
   → Review specs/{feature}/plan.md (Beck-style test ledger).
7. For each ledger item:
   /clear, "Run tdd-loop on item NN."
   → RED → red-quality-gate (auto) → GREEN → REFACTOR → commit.
8. After all ledger items merge: /review
   → Eight reviewers in parallel.
9. (User-facing surfaces) "Run browser-qa against the preview" — real-browser exploratory QA; fix + pin regressions.
10. /ship-pr
   → Tests, evals, security, spec compliance, PR drafted, human merges.
11. Phase 6 as needed: /compound "{incident description}"
12. (Only if AI feature) "Use eval-author" — calibrate to κ ≥ 0.6.
```

## Stack expectations

Agents assume:
- `pnpm` as the package manager
- `pnpm test`, `pnpm test:unit`, `pnpm test:integration`, `pnpm test:e2e`, `pnpm typecheck`
- `pnpm db:start`, `pnpm db:reset`, `pnpm db:types`
- Local Supabase CLI installed
- `gh` CLI installed for ship-pr
- `tdd-guard` installed (via `pnpm dlx tdd-guard@latest install`)

If your scripts differ, edit `.claude/settings.json` and the relevant agent files.

## Operating principles (the short version)

1. The spec is the source of truth, not the chat.
2. Plan before you write. Plan mode is a gate.
3. Decompose by concern; parallelize via subagents.
4. Guardrails go in hooks and gates (tdd-guard, red-quality-gate, pr-base-guard), not in prompts.
5. Tests for deterministic code. Evals for non-deterministic LLM behavior.
6. Phase gates require human approval.
7. /clear between unrelated features.
8. Optimize for the next hundred iterations.

## Contributing

saucestack improves by being *used*. If you hit friction on a real project, that's a field learning worth upstreaming.

- From a project bootstrapped off saucestack, run **`/saucestack-feedback`** — it classifies the lesson (generalizable vs project-specific) and opens a PR (or an issue) back here with the story attached.
- By hand: open a **field-learning** issue, or a PR against `main`. See **[.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)**.

The bar for a *starter*: **generalizable only, and keep it lean.** A change belongs here only if the next project, in a different domain, would want it unchanged.

## References

- Lenny's Newsletter — *How I AI* with Claire Vo; Boris Cherny on Claude Code
- Kent Beck — *Augmented Coding: Beyond the Vibes*
- Hamel Husain & Shreya Shankar — AI Evals
- Eugene Yan — *Product Evals in Three Steps*
- Lazar Jovanovic — four-PRD pattern
- Geoffrey Huntley — specs, subagents, ralph loop
- Andrej Karpathy — agentic engineering
- GitHub Spec Kit — `github/spec-kit`
- nizos/tdd-guard
- Anthropic — Claude Code best practices + advanced patterns

## Acknowledgements

saucestack stands on other people's work:

- **[hallmark](https://github.com/Nutlope/hallmark)** by Nutlope / Together AI (MIT) — the anti-AI-slop design skill, referenced via its own installer (`npx skills add nutlope/hallmark`) so it's always the latest version.
- **[gstack](https://github.com/garrytan/gstack)** by Garry Tan (MIT) — a design influence. saucestack's real-browser QA, JIT-injected learnings store, multi-variant prototyping, and the upcoming freeze/checkpoint/fleet patterns are adapted from gstack's approach. **No gstack code is vendored here** — the ideas are credited with thanks.
- **[tdd-guard](https://github.com/nizos/tdd-guard)** by Nizar Argov (MIT) — the PreToolUse hook that enforces test-first.
- The methodology synthesizes work by the people in **References** above.
