# Build Plan — Spec-Driven Development with Claude Code

> Synthesis: Claire Vo, Boris Cherny, Ryan Nystrom, Kent Beck, Hamel Husain, Shreya Shankar, Eugene Yan, Geoffrey Huntley, Lazar Jovanovic, Anthropic Claude Code engineering, GitHub Spec Kit, Andrej Karpathy.
> Stack: Next.js 15 · Supabase · Vercel · Resend · Tailwind · shadcn/ui.
> Posture: solo-builder, ship to Vercel preview per feature. Declare your data-sensitivity posture in CLAUDE.md.

---

## The five durable principles

1. **The spec is the source of truth, not the chat.** Versioned, repo-resident, Markdown, four files per feature.
2. **Plan before you write. Always.** Plan mode is a gate.
3. **Decompose by concern; parallelize via subagents.** One agent per job.
4. **Guardrails belong in hooks, not prompts.** `tdd-guard` blocks; prompts persuade.
5. **Tests for deterministic code. Evals for non-deterministic LLM behavior.** Never confuse them.

## The seven phases at a glance

| Phase | Artifact | Subagent / Skill | Phase gate |
|---|---|---|---|
| 0. Spec | `specs/{feature}/00–03.md` (4 files) | `pm-spec-author` | Read every line yourself |
| 1. Architecture | `specs/{feature}/design.md` + ADRs in `docs/decisions/` | `architect` + adversarial pass | Skeptical-principal review |
| 2. Prototype | `specs/{feature}/prototype.html` (when novel) | `ux-prototyper` | Stakeholder narrates flow unprompted |
| 3. Tasks | `specs/{feature}/plan.md` (Beck test ledger) | `task-planner` | Each item ≤ 90 min, one commit |
| 4. Build | Code + tests | `tdd-loop` skill (automated `red-quality-gate` between RED and GREEN) | All green; `tdd-guard` happy |
| 5. Review + Ship | `/review` → `ship-pr` skill | 8 reviewers + ship orchestration | Human merge gate |
| 6. Compound | CLAUDE.md, AGENTS.md, skills, regressions | `compound-learning` skill | Lesson is shorter than the mistake |

Plus **Phase 7 — Evals**: only when LLM output is in the user-facing path. Skip otherwise.

Plus **Project framework**: runs **once at the start of a project**, upstream of all seven phases. Produces the six docs in `docs/{project-slug}/` that every per-feature spec inherits from. See the next section.

---

## Project framework (runs once at project start)

Before the seven-phase loop runs even once, a new project needs the upstream docs that every feature spec reads in Phase 0. The `project-bootstrap` skill orchestrates this. Six docs, in dependency order, with human gates between each.

| # | Doc | Skill | What it answers | Output |
|---|---|---|---|---|
| 1 | Product vision | `/product-vision` | What is this, for whom, why now, what is it deliberately not? | `docs/{slug}/product-vision.md` |
| 2 | Domain taxonomy | `/domain-taxonomy` | What does the system observe, what does it derive, what is the shared vocabulary? | `docs/{slug}/domain-taxonomy.md` |
| 3 | Data model | `/data-model` | What entities exist, how do they relate, what's the trust model? | `docs/{slug}/data-model.md` |
| 4 | System architecture | `/system-architecture` | How is the system physically put together — boundaries, flows, interfaces? | `docs/{slug}/architecture.md` |
| 5 | Product roadmap | `/product-roadmap` | In what order do we build, what depends on what, what is deliberately deferred? | `docs/{slug}/roadmap.md` |
| 6 | Milestone-1 outline | `/milestone-outline` | For the first milestone — what ships, with what acceptance criteria, what's deferred? | `docs/{slug}/milestone-1-outline.md` |

Skip `/domain-taxonomy` for pure transaction systems with no observation/derivation layer. Every other doc is required.

The Claire-Vo-influenced disciplines this framework enforces across the six docs:
1. **JTBD over feature lists** — jobs come with canonical loss stories (named, dated specifics), not personas.
2. **Explicit non-goals at every level** — vision, roadmap, milestone outline each carry their own.
3. **Falsifiable success** — observable behaviors or numbers with timeframes, never NPS/DAU theater.
4. **Structural wedge for "why now"** — scale break or technology shift, not a competitor or trend.
5. **Deferred-decision discipline** — "decide based on what M(n) teaches" is healthy, not weak.
6. **Doc-to-doc handoffs** — each doc states what it's NOT responsible for and points to who is.
7. **Open questions with owners** — uncertainty is named, scoped, and assigned.

**Phase gate:** all six docs reviewed and approved before any feature work begins. Phase 0 (`pm-spec-author`) reads from `docs/{slug}/*` and assumes they exist.

Run this **once** per project. Refresh individual docs as the project evolves (e.g., draft `milestone-2-outline.md` after M1 ships) using the per-doc skill.

---

## Phase 0 — Four-file spec

The Lazar Jovanovic / Claire Vo pattern. Agents read context windows, not narratives — each spec file is invoked independently by the subagent that needs it.

```
specs/{feature}/
  00-master-plan.md          # What & why. Problem, users, success metrics, scope boundaries.
  01-implementation-plan.md  # How. Architecture choices, sequencing, dependencies.
  02-design-guidelines.md    # Visual tokens, accessibility, copy voice.
  03-user-journeys.md        # Top 3-5 jobs-to-be-done as step-by-step flows.
```

The `pm-spec-author` subagent:
1. Reads `brief.md`, `docs/{project-slug}/*` for context, plus `AGENTS.md` and `CLAUDE.md`.
2. Asks up to 10 clarifying questions in **one** batched message.
3. After answers, produces all four files in `specs/{feature}/`.

**Phase gate:** read every line. Vagueness here compounds into wrong code in Phase 4. Spend two hours here, save two days later.

## Phase 1 — Architecture + ADRs

Two artifacts:

- `specs/{feature}/design.md` — feature-scoped Mermaid diagram, SQL DDL with RLS inline, server action surface, Zod schemas, deployment topology, rejected alternatives.
- `docs/decisions/NNNN-title.md` — one ADR per load-bearing decision (Nygard template: Context, Decision, Consequences, Alternatives). New decisions go here, never edited after they're "accepted" — superseded by new ADRs that reference them.

Run the `architect` subagent in design mode first. Then run it again in adversarial review mode (skeptical principal) — separate context, finds holes the design author missed. The `architecture-review` skill orchestrates both passes.

**Phase gate:** every ADR explainable in two sentences to a non-technical stakeholder.

## Phase 2 — Prototype (for anything substantially new)

Run for anything substantially new that isn't already an established pattern — novel interactions, new page types, agent-in-the-loop UIs, streaming, or anywhere stakeholder buy-in matters before the build. Skip only for a well-trodden pattern already in the style guide.

`ux-prototyper` produces **2–3 meaningfully different HTML variants** + a comparison `index.html` in `specs/{feature}/prototype/`, inheriting `docs/{project-slug}/style-guide.md`. All states stacked: empty, loading, populated, error, optimistic. Run `/hallmark` on the leading variant to catch AI-slop before it hardens. The `style-guide-steward` owns the living style guide the prototypes inherit and folds new components back into it.

**Phase gate:** show one unrelated stakeholder the comparison index. If they can't narrate the flow unprompted, iterate.

## Phase 3 — Plan as test ledger

The Kent Beck artifact, ported to agent workflow. `task-planner` produces `specs/{feature}/plan.md`:

```markdown
# Test ledger: {feature}

- [ ] 01. `items` table migration creates table with RLS enabled
- [ ] 02. `items` RLS allows authenticated users to select
- [ ] 03. `items` RLS prevents writes from non-admin users
- [ ] 04. `createItem` server action validates input with Zod
- [ ] 05. `createItem` returns Result<{id}, ZodError | AuthError>
- [ ] 06. ...
```

Each item:
- One commit.
- ≤ 90 minutes of agent work.
- One test that proves it.
- One acceptance criterion from `00-master-plan.md` it satisfies.

**Phase gate:** every AC from the master plan maps to at least one ledger item; every ledger item maps to at least one AC.

## Phase 4 — TDD loop with forced stops

The `tdd-loop` skill drives each ledger item through Red → RED-quality gate → Green → Refactor → Commit, **autonomously**.

1. **RED** — `tdd-test-writer` writes the failing test, runs it, confirms it fails for the right reason. Hands off.
2. **RED-quality gate** — `red-quality-gate` runs the test itself and proves it's sound: fails for the right reason, would NOT pass against a trivial implementation (anti-false-green), non-tautological, matches the ledger item. Verdict PASS / REVISE / NO-OP / ESCALATE. It **fails closed**.
3. **GREEN** — on PASS, `tdd-implementer` writes minimal code in a separate context. Cannot modify the test. Runs the test. Stops when green.
4. **REFACTOR** — `tdd-refactor` improves clarity. Re-runs after every edit. Reverts on regression.
5. **COMMIT** — atomic conventional commit. Ledger item ticked.

Enforcement:
- The **`red-quality-gate`** replaces the human "go": it authorizes RED→GREEN only when the test is provably sound, so the loop runs unsupervised without collapsing the phases or admitting false-greens. It escalates to a human only when genuinely uncertain.
- The **`tdd-guard`** PreToolUse hook physically blocks Write/Edit on production files when no failing test is scoped. Belt; the subagent isolation is suspenders.

Test tiers handled by specialist subagents: `unit-test-author`, `integration-test-author`, `e2e-test-author`, `regression-test-author`.

**Parallelism via worktrees** (Boris Cherny pattern):

```bash
git worktree add ../feature-b -b feat/feature-b
cd ../feature-b && claude
```

Run independent ledger items in parallel worktrees. Start at 2 concurrent agents; scale to your attention. Don't worktree tasks that touch the same files.

## Phase 5 — Multi-agent review, then ship-pr

**5a. `/review`** spawns eight reviewers in parallel against `git diff main`:
1. `security-reviewer` — RLS gaps, secret leaks, service-role escape, injection
2. `compliance-reviewer` — sensitive-data exposure (defaults to "out of scope" per CLAUDE.md)
3. `type-safety-reviewer` — `any`, unsafe casts, missing Zod at boundaries
4. `performance-reviewer` — N+1, missing indexes, RSC vs client boundaries
5. `accessibility-reviewer` — WCAG 2.1 AA conformance
6. `spec-compliance-reviewer` — AC-by-AC traceability against the master plan
7. `test-quality-reviewer` — tautological assertions, mock-shape mirroring, assertion erosion
8. `pattern-conformance-reviewer` — new UI vs the explicit style guide + implied codebase patterns

Verdict: Ready / Needs attention / Needs work. Address Criticals, re-run `/review`.

**5b. `ship-pr` skill** then runs:
1. Full test suite. Stops on red.
2. Full eval suite if Phase 7 applies. Stops on >5% regression.
3. Security review on the diff.
4. Drafts PR description: what changed, why, tests added, evals affected, breaking changes, manual QA checklist.
5. Opens the PR via `gh pr create`.
6. **Does not merge.** Human merge is the last failsafe.

A fresh-context subagent then reads the PR + the master plan and answers: *"Does this PR fully and exclusively implement the spec? List spec requirements not implemented and code not justified by the spec."*

**Browser QA (user-facing surfaces).** Before ship, run the `browser-qa` skill against the Vercel preview — drive it in a real browser, walk the journeys, go off-script, fix what breaks, pin regressions. Headless e2e proves the scripted paths; this finds what a real user actually hits.

## Phase 6 — Compound learnings

The feedback loop without which the starter is static.

Every time an agent does something wrong:
1. **Fix it** in code, with a regression test that would have caught it.
2. **Add the lesson** to `CLAUDE.md` or `AGENTS.md` — one line, positive form, prune-if-default.
3. **If the lesson is a workflow**, codify it as a Skill so the agent self-invokes next time.

Every prod incident → permanent regression test in `tests/regressions/`. The pool only grows.

The `compound-learning` skill orchestrates this loop: reviews recent failures, drafts the CLAUDE.md/AGENTS.md addition, proposes the skill if applicable, opens the PR.

**Phase gate:** the lesson written is shorter than the mistake made. If it's longer, you've over-generalized.

## Phase 7 — Evals (LLM features only)

**Decision rule, applied at the call-site:** if pass/fail can be asserted in code without an LLM in the loop, it's a test (Phase 4). If it needs a human or judge, it's an eval.

Skip entirely for CRUD features. Required for any LLM-touched user surface: document Q&A, classification/scoring, summarization, agentic tool use.

Stack (consensus 2026):
- **CI gate:** Promptfoo or DeepEval. Runs every PR.
- **Platform:** Braintrust or LangSmith. Annotation UI + dashboards.
- **Inspect AI** for model-level capability/safety, separate from product quality.

Hamel Husain's three levels:
1. **Assertion evals** — `evals/{feature}/level1.test.ts`. 50–100 deterministic checks on LLM output structure. Every PR.
2. **LLM-as-judge** — `evals/{feature}/level2-judge.ts`. Run on golden set + sampled production traces, daily/weekly. **Judge prompt validated against ≥100 human labels; Cohen's κ ≥ 0.6 with humans before trusted in CI.** Re-calibrate weekly — drift is normal.
3. **Human review** — `evals/{feature}/level3-rubric.md`. 20–50 traces per release, structured rubric.

Non-negotiable: trace logging from day one. Every LLM call writes to `llm_traces` (input, retrieved context, output, model, latency, cost, user feedback). Error analysis on real traces is where the ROI lives — not in the eval framework choice.

The `eval-author` subagent scaffolds all three levels plus the trace migration. Co-develop the judge prompt with your domain expert; without expert alignment, judges produce vibes not signal.

---

## Standing rules

1. **Specs commit, plans cycle.** `00–03.md` and `design.md` stay; `plan.md` and ephemeral working state are gitignored after ship.
2. **Markdown, not JSON, for agent context.** Notion's 10x finding.
3. **Phase gates require human approval.** No auto-progression.
4. **Intern test.** Smart human intern with no context could execute the prompt in plain English? If no, ask.
5. **Optimize for the next hundred iterations.** Vibe coding wins hour one. Spec-driven dev wins month two.
6. **`/clear` between unrelated features.** Never recycle a 4-hour session.
