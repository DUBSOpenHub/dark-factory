# 🏭 Dark Factory — Lights Out Builds

![Validate](https://github.com/DUBSOpenHub/dark-factory/actions/workflows/validate.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
[![Security Policy](https://img.shields.io/badge/Security-Policy-brightgreen?logo=github)](SECURITY.md)
![Version: v1.0.0](https://img.shields.io/badge/version-v1.0.0-5E5E5E.svg)
![Platform: Copilot CLI](https://img.shields.io/badge/platform-Copilot%20CLI-232F3E.svg)
![Language: Markdown](https://img.shields.io/badge/written%20in-Markdown-000000.svg)
[![Shadow Score Spec](https://img.shields.io/badge/Shadow%20Score-Spec%20v2.0%20%7C%20Level%204-brightgreen.svg)](https://github.com/DUBSOpenHub/shadow-score-spec)

Dark Factory is a GitHub Copilot CLI skill that turns a short free-text goal into a production-grade pull request. It isolates the work in a disposable git worktree, orchestrates eight specialist agents drawn from **different model families**, and measures quality with [sealed-envelope testing](https://github.com/DUBSOpenHub/shadow-score-spec) — builders never see the hidden acceptance suite that judges them, and the suite is never written by a mind that thinks like theirs.

> ⚡ **Get started fast!** Copy this right into the [Copilot CLI](https://github.com/github/copilot-cli):
> ```
> /skills add DUBSOpenHub/dark-factory
> ```

## Contents
1. [Why Sealed-Envelope Testing?](#why-sealed-envelope-testing)
2. [Why Model Independence?](#why-model-independence)
3. [Pipeline Overview](#pipeline-overview)
4. [Command Reference](#command-reference)
5. [Installation & Setup](#installation--setup)
6. [Configuration Reference](#configuration-reference)
7. [Usage Examples](#usage-examples)
8. [Architecture Overview](#architecture-overview)
9. [Factory Operating Manual](#factory-operating-manual)
10. [FAQ](#faq)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)
13. [License](#license)

## Why Sealed-Envelope Testing?
Sealed testing creates a blindfolded QA loop: the QA Sealed agents write acceptance tests before any code exists, hide them in a vault **outside the repository**, and the builder never sees them. The gap between what the sealed suite demands and what the code delivers reveals whether the build is trustworthy.

**Benefits**
- **Prevents overfitting.** Builders can’t “teach to the test” because they never see the sealed suite.
- **Quantifies quality.** [Shadow scores](https://github.com/DUBSOpenHub/shadow-score-spec) (sealed failures ÷ sealed total) expose blind spots numerically.
- **Automates escalation.** Hardening cycles fire automatically, but the engineer still sees only failure messages.
- **Retains speed.** Express mode still produces sealed tests immediately after setup, so even fast fixes retain coverage.

**Comparison**
| Approach | What builders see | When tests are written | Blind-spot risk |
|----------|------------------|------------------------|-----------------|
| Classic TDD | Entire suite | During implementation | Spec drift if requirements change mid-build |
| Manual QA | Human docs | Post-build | Slow feedback, inconsistent coverage |
| **Dark Factory** | Only failure messages | Before Phase 3, hidden until validation | Shadow score proves whether the spec was truly covered |

## Why Model Independence?

> A Shadow Score is only meaningful if the tests and the code come from **different minds**.

Hiding the tests answers *“can the builder **see** the tests?”* It does not answer *“does the builder **think like** the test author?”*

v0.1.0 assigned the same model to both `qa_sealed` and `lead_eng`. Two instances of one model family share training data, reasoning priors, and — critically — **failure modes**. If the family doesn’t think to test Unicode homographs, it also doesn’t think to normalise them. The sealed test is never written, the code is never hardened, the score reads **0%**, and the bug ships with a green light.

**The bias is not random. It always points toward 0%** — the system overclaims quality exactly when it is least entitled to.

Dark Factory v1.0 makes cross-family separation an **invariant**, checked at Phase 0 and in CI:

| Pair | If same family | Verdict |
|------|----------------|---------|
| Seal author == Implementer | Score too low → overclaims quality | ❌ **forbidden** |
| PM == Implementer | Builder infers unstated assumptions | ❌ **forbidden** |
| Arch Critic == Architect | Critic inherits the designer’s blind spots | ❌ **forbidden** |
| Red Team == Implementer | Attacker inherits the builder’s assumptions | ❌ **forbidden** |
| PM == Seal author | Score too high → conservative | ⚠️ allowed, must be disclosed |

Note the asymmetry: **not every overlap is equally harmful.** A pairing that biases the score *upward* is conservative and therefore tolerable; a pairing that biases it *downward* is not, because it hides defects. Blanket “everything must differ” rules miss this distinction.

Every report carries its own provenance, so a score can be trusted or discarded on evidence:

```json
"independence": "strong",
"seal_families": ["openai", "google"],
"implementer_family": "anthropic"
```

If the invariant is violated and `on_violation: warn` is set, the run continues but every report is stamped ⚠️ **ADVISORY** and is explicitly non-authoritative. See [`protocols/model-independence.md`](protocols/model-independence.md).

### Seal plurality

One sealed suite tells you whether the **code** is right. Two independent sealed suites tell you whether the **specification** is right.

When two model families read the same PRD and write *contradictory* assertions, at least one of them inferred something the spec never stated. Dark Factory measures this as `spec_ambiguity` and refuses to build against a spec that is too ambiguous to build against — because the code would be correct against one reading and wrong against the other, and nobody would know which.

## Pipeline Overview
```
                    🏭 DARK FACTORY — LIGHTS OUT LINE

  Phase 0        Phase 1        Phase 2a/2b      Phase 2.5
  Setup +    →   Product    →   QA 🔒 ×N     →   Ambiguity +
  Invariants     Spec           + Architecture    Arch Critique
                                                       │
        ┌──────────────────────────────────────────────┘
        ▼
  Phase 3        Phase 4          Phase 4.5      Phase 5
  Build +    →   Verify        →  Red Team   →   Hardening
  Open Tests     (disposable       (attacks       (multi-turn,
                  worktree)         the spec)      escalating)
                       │
                       ▼
        Phase 6 Delivery — always human-approved
                       │
                       ▼
        Phase 7 Outcome Eval + Calibration (optional)
```

**What each new phase buys you**

| Phase | Adds | Catches |
|-------|------|---------|
| **0** | Invariant enforcement | A biased run, *before* spending a cent on it |
| **2.5a** | Spec ambiguity gate | Requirements that support two different systems |
| **2.5b** | Architecture critique | Design flaws while they cost one agent turn, not a rewrite |
| **4.5** | Red team | Vulnerabilities the spec never thought to forbid |

*Express mode* condenses to: Phase 0 → (express QA Sealed from raw goal) → Phase 3 → Phase 4 → Phase 5 (hardening, runs only when shadow score > 0%) → Phase 6. Express skips **specification** phases, never quality gates.

*Tournament mode* runs N cross-family competitors through Phase 3 in parallel, grades them all against the **same** envelope, and delivers only the winner.

## Command Reference
| Command | Purpose |
|---------|---------|
| `dark factory — <goal>` | Full pipeline with checkpoints at every phase. |
| `dark factory dark — <goal>` | Full pipeline, no phase prompts. Gates still fire; delivery still needs a human. |
| `dark factory express — <goal>` | Skips PRD/ARCH, still seals tests from the raw goal, single checkpoint at delivery. |
| `dark factory tournament — <goal>` | N cross-family competitors, one shared envelope, leaderboard + failure-overlap report. |
| `dark factory pareto — <goal>` | Tournament that reports the non-dominated (quality, cost) set instead of one winner. |
| `dark factory premium — <goal>` | Routes all agents through `config.roles.*.premium` for one run. |
| `dark factory conformance` | Prints the resolved families, invariant status, and Shadow Score Spec level. |
| `dark factory resume` | Reloads the most recent `state.json` and continues from the saved phase. |
| `dark factory status` | Prints `state.json` plus any pending outcome evaluations without mutating state. |
| `dark factory evaluate <run-id>` | Launches Phase 7 Outcome Evaluator for an archived run. |

## Installation & Setup
### Prerequisites
- Git 2.35+ with worktree support.
- GitHub Copilot CLI `>= 0.13.0` (skills `/skills add` available).
- Access to **at least two model families** (e.g. Anthropic + OpenAI, or OpenAI + Google). Without this, Level 4 conformance is unreachable and scores are advisory only.
- Python 3.10+ with `pyyaml` to run the conformance validator; Node 18+ for markdown lint.

### Steps
1. **Clone**: `git clone https://github.com/DUBSOpenHub/dark-factory.git && cd dark-factory`
2. **Register the skill**: `/skills add .`
3. **Tune `config.yml`** — start with `roles` and confirm your families are available.
4. **Verify conformance**: `python3 .github/scripts/validate_conformance.py`
5. **Smoke test**: `dark factory express — say hello world` to confirm isolation + sealed QA work end to end.
6. **Optional**: install markdownlint + yamllint to reproduce CI locally.

> Run step 4 after every `config.yml` edit. A configuration that violates an invariant will abort at Phase 0 anyway — catching it in one second beats catching it after the run has already paid for a PRD.

## Configuration Reference
Dark Factory reads `config.yml` on every run and never hardcodes tunables. Run `python3 .github/scripts/validate_conformance.py` after editing it — the independence invariants are machine-checked.

### `invariants` — hard preconditions (Phase 0 aborts on violation)
| Key | Default | Purpose |
|-----|---------|---------|
| `cross_family_required` | `true` | Seal author and implementer must be different model families. |
| `seal_plurality_min` | `2` | Minimum independent families authoring sealed suites. `>= 2` enables the ambiguity gate. |
| `workspace_isolation` | `strict` | `strict` = disposable verify worktree. `legacy` = Spec v1.0.0 §4.3 copy-in behaviour. |
| `on_violation` | `abort` | `abort` or `advisory` (run continues, report stamped ⚠️ ADVISORY). |

### `families` / `model_capabilities`
`families` maps every model to a family so invariants can be evaluated. `model_capabilities` records which knobs each model actually accepts — several models take no `reasoning_effort` at all, and passing one anyway is a silent failure. The orchestrator **omits** unsupported parameters rather than downgrading them, and CI validates every configured dispatch against this map.

### `roles` — model + effort + context tier, per role
| Role | Default | Effort | Why |
|------|---------|--------|-----|
| `product_mgr` | `gpt-5.5` | `medium` | PRD author. |
| `architect` | `claude-opus-5` | `xhigh` | Highest-leverage one-shot decision in the run. |
| `arch_critic` | `gpt-5.6-terra` | `xhigh` | Must differ in family from `architect`. |
| `qa_sealed` | `gpt-5.6-terra` | `max` | Must differ in family from `lead_eng`. Best dollar in the pipeline. |
| `lead_eng` | `claude-opus-4.8` | `medium` | Builder + hardening. |
| `qa_validator` | `gemini-3.6-flash` | `low` | Mechanical — runs a test runner and counts. Don't pay to think. |
| `red_team` | `gpt-5.6-sol` | `xhigh` | Attack is a reasoning task. Must differ from `lead_eng`. |
| `outcome_evaluator` | `claude-sonnet-5` | `high` | Phase 7 analyst. |
| `classifier` | `gemini-3.6-flash` | `minimal` | Sub-second express/full triage. |

> `reasoning_effort` is the cost lever that matters. Buying quality by swapping the model SKU is the 2025 move; effort is cheaper and far more targeted. Spend it on sealed test authoring, architecture, and red teaming — not on running a test runner.

### `seal_plurality`
| Key | Default | Purpose |
|-----|---------|---------|
| `enabled` | `true` | Author N sealed suites from N families. |
| `authors` | `gpt-5.6-terra`, `gemini-3.1-pro-preview` | One entry per independent suite. |
| `express_authors` | `1` | Express uses a single author to stay fast. |

### `tournament`
| Key | Default | Purpose |
|-----|---------|---------|
| `enabled` | `false` | Opt in per run with `dark factory tournament`. |
| `competitors` | anthropic / moonshot / microsoft | No competitor may share a family with a seal author. |
| `enforce_judge_independence` | `true` | CI-checked. |
| `all_fail_spec_review_threshold` | `40` | If every competitor scores above this, the **spec** is the defect — escalate instead of hardening. |

### `hardening`
| Key | Default | Purpose |
|-----|---------|---------|
| `max_cycles` | `4` | Cycles before escalation. |
| `ladder` | 4 rungs | Each rung escalates. Rung 3 switches **family** — identical retries are rerolling, not hardening. |
| `max_reveal` | `assertions` | Progressive disclosure ceiling. **Never** includes test source. |

### `autonomy`
| Key | Default | Purpose |
|-----|---------|---------|
| `mode` | `supervised` | `dark` / `supervised` / `manual`. |
| `gates.spec_ambiguity_max` | `0.25` | Sealed-suite disagreement ratio. |
| `gates.arch_critic_severity` | `high` | Escalate on findings at or above this severity. |
| `gates.shadow_score_max` | `10` | Sealed failure percentage. |
| `gates.red_team_high_findings_max` | `0` | Any high-severity finding stops the line. |
| `gates.cost_ceiling_usd` | `5.00` | Hard stop. |
| `on_gate_breach` | `park_and_notify` | `park_and_notify` or `abort`. |

> **Delivery always requires human approval, in every mode.** Not configurable.

### `safety`
| Key | Default | Purpose |
|-----|---------|---------|
| `summarize_artifacts` | `false` | v0.1.0 summarised by default. With long-context tiers that is now **harmful** — it lossy-compresses the contract both the tests and the code derive from, so the Shadow Score ends up measuring the summariser. |
| `max_prd_lines` | `2000` | Emergency backstop only. |
| `max_artifact_lines` | `5000` | Emergency backstop only. |

Acceptance criteria always pass through verbatim. If a backstop ever fires, the run is flagged `spec_truncated` and its score is reported as ADVISORY.

### `isolation`
| Key | Default | Purpose |
|-----|---------|---------|
| `workspace_root` | `.factory` | Root for worktrees. |
| `branch_prefix` | `factory/` | Branch prefix per run. |
| `vault_dir` | `~/.factory-vault` | Sealed tests live **outside the repo** — `.factory/sealed/` sat inside the builder's world, reachable by its unscoped `bash`/`glob`/`grep`. |
| `verify_dir` | `.factory/verify` | Disposable worktree built from the engineer's commit, destroyed after validation. |
| `canary_enabled` | `true` | A canary in the vault; access forces the score to INVALID. |
| `state_file` | `.factory/state.json` | Crash-recovery ledger. |

### `learning`
| Key | Default | Purpose |
|-----|---------|---------|
| `blind_spot_memory` | `true` | **Loop A** — seed QA Sealed with defect classes that historically escaped in this stack. |
| `empirical_routing` | `true` | **Loop B** — route roles by measured Shadow Score instead of by guesswork in this file. |
| `calibration` | `true` | **Loop C** — compare Phase 4 score against Phase 7 outcome; if 0% runs still fail post-ship, the suites are too shallow. |

### `premium`
Per-role overrides for `dark factory premium`. v0.1.0 applied a single `premium_model` to every role — that is now a conformance bug, because routing all agents through one flagship model collapses the pipeline into one family and silently voids the Shadow Score. Premium raises capability **within** each role's family.

### `reporting`
| Key | Default | Purpose |
|-----|---------|---------|
| `spec_version` | `2.0.0` | Stamped into every report. |
| `conformance_level` | `4` | Adversarial Independence. |
| `emit_json` | `true` | Emit `SHADOW-REPORT.json` with the Spec §5.2 required fields, so scores are comparable across tools instead of regex-scraped out of prose. |

## Usage Examples
### 1. Full build (“Lights Out”)
```
dark factory — build a CLI that audits dependencies for GPL licenses
```
Expected output snippet:
```
🏭 Run: run-20260401-1215 | Mode: FULL | Autonomy: SUPERVISED
🏭 Phase 0 ✅ Invariants OK — impl=anthropic  seals=openai,google  independence=strong
🏭 Phase 2 🔒 SHA-256 (sealed envelope, 2 suites): sha256:d3b1...
🏭 Phase 2.5 ✅ spec_ambiguity 0.06 ≤ 0.25 | arch_critic: medium ≤ high
🏭 SHADOW_SCORE: 11.1% (2 sealed failures — 1 security, 1 edge_case)
🏭 Phase 4.5 ✅ Red team: 0 high / 1 medium
🏭 Delivery report ready — approve / reject
```
Tips: provide scope (“CLI”, “API”) so the PRD agent knows what to model; use checkpoints to add clarifications without restarting.

### 2. Express fix
```
dark factory express — add rate limiting middleware to REST API
```
Expected output snippet:
```
🏭 Mode: EXPRESS (classifier: single file, no new deps, no auth surface)
🏭 QA Sealed (express) derived acceptance criteria from raw goal
🏭 Phase 6 — delivery checkpoint (only gate)
```
Use express for quick hardening tasks or doc-only fixes. Sealed QA still runs from the goal text, and gates still fire.

### 3. Tournament
```
dark factory tournament — build a CSV import CLI with validation
```
Expected output snippet:
```
🏭 Mode: TOURNAMENT | 3 competitors: anthropic, moonshot, microsoft
🏭 Sealed envelope written BEFORE any competitor started: sha256:9f3c1a
🥇 claude-opus-4.8   5.6%  $1.90
🥈 kimi-k2.7-code   11.1%  $0.60
🥉 mai-code-1-flash 22.2%  $0.20
⚠️  test_rejects_path_traversal failed for ALL competitors → spec defect, not a model defect
```
Model selection stops being folklore and becomes an **output** of the pipeline. The failure-overlap table is the real product: when every competitor fails the same test, no amount of model swapping will fix it.

### 4. Outcome evaluation
```
dark factory evaluate run-20260401-1215
```
Expected output snippet:
```
🏭 OUTCOME EVALUATION — Run run-20260401-1215
🏭 PRD Criteria Met: 6/7 | KPIs On Track: 2/3
🏭 Outcome Score: 75/100
🏭 Calibration: ⚠️ optimistic — Shadow 0% but 2 escaped defects (1 spec gap, 1 suite gap)
```
If `auto_evaluate_after_days > 0`, the factory will prompt you when a run is due even without this command. Calibration feeds Learning Loop C: an escaped defect is the highest-value signal the system produces, and v0.1.0 threw it away.

## Architecture Overview
- **Factory Manager (SKILL.md):** Loads config, enforces the Phase 0 invariants, determines mode, and routes each `task()` call to the right model with the right `reasoning_effort` and `context_tier` — omitting parameters the model doesn't support.
- **Agent Team (8):** Product Manager → QA Sealed ×N & Architect (parallel) → Arch Critic → Lead Engineer → QA Validator → Red Team → Outcome Evaluator. Agents are stateless and receive only what the handoff manifest passes. The exception is hardening, which continues the **same** engineer via `write_agent` so it never re-tries an approach it already ruled out.
- **Agent types:** the pipeline uses purpose-built CLI agent types rather than making everything `general-purpose` — `rubber-duck` for the Arch Critic, `security-review` for the Red Team, `task` for the QA Validator, `explore` for complexity triage.
- **Isolation:** Every run lives in `.factory/runs/<run-id>`. Sealed tests live in `~/.factory-vault/<run-id>`, **outside the repository**, and are executed in a throwaway worktree. The builder's tree never contains sealed files at any point.
- **Independence:** Every role resolves to a model family. Seal authors and the implementer may never share one. Enforced at Phase 0 and in CI.
- **State & Reporting:** `state.json` persists mode, phase, artifacts, sealed hash, gate results, and checkpoint decisions. SQLite tables (`factory_runs`, `phase_results`, `sealed_suites`, `blind_spots`) carry provenance, cost, hardening velocity, and cross-run memory.
- **Templates & Protocols:** Agents follow the markdown templates in `templates/` and the invariants in `protocols/` (sealed envelope, model independence, gates).

## Factory Operating Manual
### Sealed Test Lifecycle
1. **Authoring (Phase 2a or Express QA):** N QA Sealed agents from N different families write runnable tests using only PRD text or raw goals — independently, never seeing each other's work.
2. **Ambiguity check (Phase 2.5a):** Suites are compared for contradictions. Contradictions mean the *spec* is ambiguous and gate the run; divergences are the healthy coverage dividend of plurality.
3. **Hashing:** The Factory Manager records a SHA-256 hash over the merged envelope and stores it in `state.json`.
4. **Vault storage:** Files live in `~/.factory-vault/<run-id>` (mode `700`) with a canary file — **outside the repository**, because the builder's `bash`/`glob`/`grep` are unscoped and anything inside its worktree is reachable regardless of what the prompt says.
5. **Execution (Phase 4):** A disposable worktree is created from the engineer's commit, both suites run there, and the worktree is destroyed. Sealed tests are never written into the builder's workspace — not even temporarily.
6. **Integrity:** A canary atime change sets `seal_broken: true` and invalidates the score.
7. **Archive:** On delivery approval, sealed files plus PRD/ARCH/SHADOW/RED-TEAM reports are archived under `.factory/archive/<run-id>` for outcome evaluation.

### State File Anatomy
| Key | Meaning | Example |
|-----|---------|---------|
| `run_id` | Unique identifier for the current build | `run-20260401-1215` |
| `mode` | `full`, `express`, or `tournament` | `full` |
| `autonomy` | `dark`, `supervised`, or `manual` | `supervised` |
| `current_phase` | Phase identifier (`0`–`7`, including `2.5` and `4.5`) | `3` |
| `independence` | `strong` or `weak` | `strong` |
| `seal_families` | Families that authored the envelope | `["openai","google"]` |
| `sealed_hash` | Integrity check for hidden tests | `sha256:d3b1...` |
| `initial_shadow_score` | First validation, before any hardening | `22.2` |
| `gates` | Measured value, threshold, and status per gate | `{ "shadow_score": { "value": 4.0, ... } }` |
| `checkpoints` | Map of checkpoint decisions keyed by checkpoint number | `{ "1": { "status": "approved", ... } }` |

> **Checkpoint entry format** (see [`protocols/checkpoint-gate.md`](protocols/checkpoint-gate.md)): each entry is `{ "status": "approved", "feedback": null, "decided_at": "2026-02-23T21:35:00Z" }`. Status may be `approved`, `modified`, or `aborted`.

| `evaluation_due_at` | Timestamp when Phase 7 should auto-trigger | `2026-04-08T13:00:00Z` |
| `artifacts` | Map of produced files (prd, arch, shadow_report, red_team) | `{ "prd": "PRD.md", ... }` |

### Quality Gates
Gates are evaluated automatically in **every** autonomy mode, and a breach must print the measured value, the threshold, and the specific findings. A breach that cannot explain itself is not actionable.

| Gate | Phase | Default | Meaning of a breach |
|------|-------|---------|---------------------|
| Spec ambiguity | 2.5a | `0.25` | Two families read the spec differently — the requirements support two different systems. |
| Architecture critique | 2.5b | `high` | A design flaw that guarantees a defect class, caught before a line of code exists. |
| Shadow Score | 4 | `10%` | Sealed failures. Above 25% suggests spec/test misalignment, not just a buggy build. |
| Red team | 4.5 | `0 high` | An exploitable vulnerability the spec never thought to forbid. |
| Cost | any | `$5.00` | Hard stop. |
| Seal integrity | 4 | — | Canary read or hash mismatch. **Always aborts** — the score is meaningless. |

Beyond the gates: exceeding `hardening.max_cycles` triggers the continue/deliver/abort decision, and anything under 70/100 in OUTCOME-REPORT.md triggers a follow-up action item.

### Operator Checklist
- [ ] Confirm `.factory/` is gitignored (see `.gitignore`).
- [ ] Run `python3 .github/scripts/validate_conformance.py` after any `config.yml` change.
- [ ] Keep agent prompts under 200 lines (`wc -l agents/*.md`).
- [ ] Update `catalog.yml` version **and** `links.agents` whenever prompts change or are added.
- [ ] Run `.github/workflows/validate.yml` locally (or via PR) before merging.
- [ ] Archive finished runs you care about; delete stale entries with `rm -rf .factory/archive/run-*`.
- [ ] Review [`docs/ADR.md`](docs/ADR.md) before proposing governance changes.

### Run Artifacts & Locations
| Artifact | Produced By | Stored In | Notes |
|----------|-------------|-----------|-------|
| `PRD.md` | Product Manager | Worktree root & archive | Acceptance criteria pass through verbatim. |
| `ARCH.md` | Architect | Worktree root & archive | Contains diagrams + contracts. |
| `ARCH-CRITIQUE.md` | Arch Critic | Worktree root & archive | Requirement-coverage walk + severity-graded findings. |
| `AMBIGUITY.md` | Factory Manager | Worktree root & archive | Names disputed **behaviours**, never test source. |
| `SHADOW-REPORT.md` | QA Validator | Worktree root & archive | Score, coverage comparison, failure table, trend. |
| `SHADOW-REPORT.json` | QA Validator | Worktree root & archive | Spec §5.2 required fields + provenance. |
| `RED-TEAM.md` | Red Team | Worktree root & archive | Breach Score; findings classed spec-gap vs implementation-bug. |
| `TOURNAMENT.md` | Factory Manager | Worktree root | Leaderboard + failure overlap (tournament mode only). |
| `FACTORY-REPORT.md` | Factory Manager | Worktree root | Delivery summary. |
| Sealed tests | QA Sealed ×N | `~/.factory-vault/<run-id>` | Outside the repo; hashed; canary-protected. |
| `OUTCOME-REPORT.md` | Outcome Evaluator | Worktree & archive | KPIs, escaped defects, calibration. |

### Data Retention & Cleanup
- `.factory/runs/` should contain only active runs. Delivery/abort must delete the worktree and branch immediately.
- `.factory/archive/` feeds Phase 7; keep what you need, prune the rest.
- `state.json` is recreated for every run and may be deleted once the run is merged and archived.

## FAQ
1. **Does express mode skip QA?** No. QA Sealed still writes tests — it just uses the raw goal as its spec. Express skips *specification* phases, never quality gates.
2. **Why can't I use the same model for everything?** Because then the tests and the code come from the same mind. Correlated blind spots make the sealed test never fire, and the score reads 0% on a build that has real defects. The bias always points toward overclaiming quality. See [Why Model Independence?](#why-model-independence).
3. **What if I only have access to one model family?** Set `invariants.on_violation: advisory`. The run proceeds, but every report is stamped ⚠️ ADVISORY and is explicitly non-authoritative. An honest "we can't measure this" beats a confident wrong number.
4. **Is seal plurality worth the extra cost?** It is the only way to measure whether your *specification* is ambiguous. One suite grades the code; two independent suites grade the requirements. Set `seal_plurality.enabled: false` and `invariants.seal_plurality_min: 1` to opt out.
5. **Where do sealed tests live?** `~/.factory-vault/<run-id>` — outside the repository. `.factory/sealed/` sat inside the builder's own worktree, and the builder has unscoped `bash`/`glob`/`grep`. Isolation has to be filesystem topology, not prompt wording.
6. **Are sealed tests copied into the build workspace?** No. A disposable worktree is created from the engineer's commit, both suites run there, and it is destroyed. This is a deliberate divergence from Spec v1.0.0 §4.3 — set `invariants.workspace_isolation: legacy` to restore the old behaviour.
7. **Can I run different models per agent?** Yes — that's mandatory now. Edit `config.roles.*`, then run the conformance validator.
8. **What is `reasoning_effort` and where should I spend it?** It's the per-call thinking budget. Spend it on sealed test authoring, architecture, and red teaming; not on the validator, which just runs a test runner and counts. Note that some models accept no effort parameter at all — check `config.model_capabilities`.
9. **Does hardening ever show the engineer the tests?** Never the source. At the final rung `max_reveal: assertions` exposes the failing assertion text, which turns an unbounded guess into a solvable problem without breaking the seal that produced the score.
10. **What does a 0% Shadow Score actually prove?** That the implementation satisfies the spec *as tested*, by test authors who don't think like the builder. It says nothing about what the spec forgot — that's the Red Team's job, and the calibration loop's.
11. **When is Phase 7 triggered automatically?** If `auto_evaluate_after_days > 0`, `dark factory status` or `resume` checks for due runs and launches the Outcome Evaluator.
12. **What’s the “Lights Out” codename about?** Building in the dark — sealed tests, no human on the floor — until the delivery checkpoint turns the lights back on. Autonomy means autonomous *with evidence*, not autonomous with permission.

## Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `⛔ INVARIANT VIOLATION: cross_family_required` | Seal author and implementer resolve to the same family | Change `config.roles.qa_sealed.model` or `lead_eng.model`, then run the conformance validator. |
| `model 'X' does not support reasoning_effort 'Y'` | A role is configured with a knob its model doesn't accept | Check `config.model_capabilities`; omit the parameter for models with an empty `effort` list. |
| Run stops at `spec_ambiguity 0.33 > 0.25` | Two families read the PRD differently | Read `AMBIGUITY.md`, resolve the contradictions in the PRD, re-run. This is the gate working. |
| Shadow Score stamped ⚠️ ADVISORY | `on_violation: advisory` with a violated invariant | Fix the family assignment for an authoritative score. |
| `seal_broken: true` | The vault canary was read during the build | Treat the score as invalid. Check for a tool with vault path access; re-run. |
| `fatal: worktree add` fails | Dirty git state/untracked files | Commit/stash changes, ensure `.factory/` is gitignored, rerun. |
| QA Sealed crashes citing “unknown stack” | Goal/PRD lacked tech hints | Add a “Technical Constraints” section or mention the runtime in the goal; rerun Phase 2. |
| Shadow Score stays >0 after max cycles | Hardening limit reached | Choose **continue-hardening** to reset the counter or **deliver-as-is** to surface outstanding failures. Check `hardening_velocity` — a flat trend means the *spec* is the problem. |
| Every tournament competitor fails the same test | Specification defect, not a model defect | Fix the PRD. Swapping models will not help. |
| `state.json` missing for resume | Worktree cleaned manually | Use `dark factory status` to list available runs; if none, restart from Phase 0. |
| Markdown lint fails in CI | Missing newline at EOF or long lines | Run `markdownlint-cli2` locally. |
| YAML validation job fails | Syntax error in `config.yml` or `catalog.yml` | Run `python -c "import yaml; yaml.safe_load(open('config.yml'))"` to pinpoint the issue. |
| “agent files exist but are not listed in catalog.yml” | Added a prompt without updating the catalog | Add the path to `catalog.yml` under `links.agents`. |

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow (branch naming, testing playbooks, PR template). Before opening a PR, run `.github/workflows/validate.yml` locally or via GitHub Actions.

**Quick ways to help:**
- 🐛 [Report a bug](https://github.com/DUBSOpenHub/dark-factory/issues/new?template=bug_report.md)
- 💡 [Suggest a feature](https://github.com/DUBSOpenHub/dark-factory/issues/new?template=feature_request.md)
- 🏭 [Share a build](https://github.com/DUBSOpenHub/dark-factory/discussions/new?category=show-and-tell)

## License
Released under the [MIT License](LICENSE) © 2026 DUBSOpenHub.

---

🐙 Created with 💜 by [@DUBSOpenHub](https://github.com/DUBSOpenHub) with the [GitHub Copilot CLI](https://docs.github.com/copilot/concepts/agents/about-copilot-cli).

Let's build! 🚀✨
