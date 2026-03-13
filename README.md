# 🏭 Dark Factory — Lights Out Builds

![Validate](https://github.com/DUBSOpenHub/dark-factory/actions/workflows/validate.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
[![Security Policy](https://img.shields.io/badge/Security-Policy-brightgreen?logo=github)](SECURITY.md)
![Version: v0.1.0](https://img.shields.io/badge/version-v0.1.0-5E5E5E.svg)
![Platform: Copilot CLI](https://img.shields.io/badge/platform-Copilot%20CLI-232F3E.svg)
![Language: Markdown](https://img.shields.io/badge/written%20in-Markdown-000000.svg)
[![Shadow Score Spec](https://img.shields.io/badge/Shadow%20Score-Spec%20v1.0.0%20%7C%20Level%203-brightgreen.svg)](https://github.com/DUBSOpenHub/shadow-score-spec)

Dark Factory is a GitHub Copilot CLI skill that turns a short free-text goal into a production-grade pull request. It isolates the work in a disposable git worktree, orchestrates six specialist agents, and measures quality with [sealed-envelope testing](https://github.com/DUBSOpenHub/shadow-score-spec) — builders never see the hidden acceptance suite that judges them.

> ⚡ **Get started fast!** Copy this right into the [Copilot CLI](https://github.com/github/copilot-cli):
> ```
> /skills add DUBSOpenHub/dark-factory
> ```

## Contents
1. [Why Sealed-Envelope Testing?](#why-sealed-envelope-testing)
2. [Pipeline Overview](#pipeline-overview)
3. [Command Reference](#command-reference)
4. [Installation & Setup](#installation--setup)
5. [Configuration Reference](#configuration-reference)
6. [Usage Examples](#usage-examples)
7. [Architecture Overview](#architecture-overview)
8. [Factory Operating Manual](#factory-operating-manual)
9. [FAQ](#faq)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)
12. [License](#license)

## Why Sealed-Envelope Testing?
Sealed testing creates a blindfolded QA loop: the QA Sealed agent writes acceptance tests before any code exists, hides them in `.factory/sealed/`, and the builder never sees them. The quality gap between sealed tests and the engineer's tests reveals whether the build is trustworthy.

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

## Pipeline Overview
```
                 🏭 DARK FACTORY — LIGHTS OUT LINE
┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐┌──────────────┐
│ Phase 0      ││ Phase 1      ││ Phase 2a/2b ││ Phase 3      ││ Phase 4      ││ Phase 5      │
│ Factory Setup││ Product Spec ││ QA 🔒 + Arch ││ Build + Tests││ Sealed QA    ││ Hardening    │
└─────┬────────┘└─────┬────────┘└─────┬────────┘└─────┬────────┘└─────┬────────┘└─────┬────────┘
      │               │               │               │               │               │
      ▼               ▼               ▼               ▼               ▼               ▼
                           Phase 6 Delivery (always checkpointed)
                                   │
                                   ▼
                           Phase 7 Outcome Eval (optional)
```
*Express mode* condenses to: Phase 0 → (express QA Sealed from raw goal) → Phase 3 → Phase 4 → Phase 5 (hardening, runs only when shadow score > 0%) → Phase 6.

## Command Reference
| Command | Purpose |
|---------|---------|
| `dark factory — <goal>` | Full pipeline (Phases 0–6) with checkpoints at every phase. |
| `dark factory express — <goal>` | Skips PRD/ARCH, still seals tests from the raw goal, single checkpoint at delivery. |
| `dark factory resume` | Reloads the most recent `state.json` and continues from the saved phase. |
| `dark factory status` | Prints `state.json` plus any pending outcome evaluations without mutating state. |
| `dark factory evaluate <run-id>` | Launches Phase 7 Outcome Evaluator for an archived run. |
| `dark factory premium — <goal>` | Routes all agents through `config.models.premium_model` for one run. |

## Installation & Setup
### Prerequisites
- Git 2.35+ with worktree support.
- GitHub Copilot CLI `>= 0.13.0` (skills `/skills add` available).
- Python 3.10+ and Node 18+ if you want to run the validation workflow locally.

### Steps
1. **Clone**: `git clone https://github.com/DUBSOpenHub/dark-factory.git && cd dark-factory`
2. **Register the skill**: `/skills add .`
3. **Tune `config.yml`** (models, limits, logging).
4. **Smoke test**: `dark factory express — say hello world` to ensure isolation + sealed QA works.
5. **Optional**: install markdownlint + yamllint to reproduce CI locally.

## Configuration Reference
Dark Factory reads `config.yml` on every run and never hardcodes tunables.

### `factory`
| Key | Default | Purpose |
|-----|---------|---------|
| `default_mode` | `full` | Pipeline used when the goal doesn’t specify express. |
| `max_hardening_cycles` | `3` | Number of automatic hardening loops before escalation. |
| `express_threshold_words` | `15` | Goals shorter than this switch to express mode automatically. |
| `agent_timeout_sec` | `300` | Cancels any agent call that runs longer than this many seconds. |
| `max_retries` | `1` | Automatic retries for transient agent failures/timeouts. |
| `verbosity` | `info` | Logging level for factory status output (`debug`, `info`, `warn`, `error`). |

### `safety`
| Key | Default | Purpose |
|-----|---------|---------|
| `max_prd_lines` | `180` | Caps PRD.md to stay within downstream context windows. |
| `max_artifact_lines` | `600` | Cap for ARCH, SHADOW reports, and other artifacts. |

### `isolation`
| Key | Default | Purpose |
|-----|---------|---------|
| `workspace_root` | `.factory` | Root directory for worktrees and sealed tests. |
| `branch_prefix` | `factory/` | Branch prefix used for each run. |
| `sealed_dir` | `.factory/sealed` | Storage for hidden tests; never checked out into the worktree. |
| `state_file` | `.factory/state.json` | Crash-recovery ledger. |

### `models`
| Key | Default | Purpose |
|-----|---------|---------|
| `product_mgr` | `claude-sonnet-4.6` | PRD author. |
| `architect` | `claude-sonnet-4.6` | System designer. |
| `qa_sealed` | `claude-sonnet-4.6` | Hidden test author. |
| `lead_eng` | `claude-sonnet-4.6` | Builder + hardening. |
| `qa_validator` | `claude-haiku-4.5` | Sealed test runner. |
| `outcome_evaluator` | `claude-sonnet-4.6` | Phase 7 analyst. |
| `premium_model` | `claude-opus-4.6` | Override when the user says “premium.” |

### `checkpoints`
| Key | Default | Purpose |
|-----|---------|---------|
| `gates` | `after_prd`, `after_arch`, `after_build`, `after_validation`, `delivery` | Human decision points. Express keeps only `delivery`. |
| `allow_skip_all` | `true` | If true, users can auto-approve everything **except** final delivery. |

### `outcome_evaluation`
| Key | Default | Purpose |
|-----|---------|---------|
| `auto_evaluate_after_days` | `0` | Auto Phase 7 schedule (0 disables automation). |
| `archive_dir` | `.factory/archive` | Storage for PRD/ARCH/SHADOW consumed by Phase 7. |

## Usage Examples
### 1. Full build (“Lights Out”)
```
dark factory — build a CLI that audits dependencies for GPL licenses
```
Expected output snippet:
```
🏭 Run: run-20260401-1215 | Mode: FULL
🏭 Phase 2 🔒 SHA-256 (sealed tests): sha256:d3b1...
🏭 SHADOW_SCORE: 11.1% (2 sealed failures)
🏭 Delivery report ready — approve / reject
```
Tips: provide scope (“CLI”, “API”) so the PRD agent knows what to model; use checkpoints to add clarifications without restarting.

### 2. Express fix
```
dark factory express — add rate limiting middleware to REST API
```
Expected output snippet:
```
🏭 Mode switched to EXPRESS (goal length=8 words)
🏭 QA Sealed (express) derived acceptance criteria from raw goal
🏭 Phase 6 — delivery checkpoint (only gate)
```
Use express for quick hardening tasks or doc-only fixes. Sealed QA still runs from the goal text.

### 3. Outcome evaluation
```
dark factory evaluate run-20260401-1215
```
Expected output snippet:
```
🏭 OUTCOME EVALUATION — Run run-20260401-1215
🏭 PRD Criteria Met: 6/7 | KPIs On Track: 2/3
🏭 Outcome Score: 75/100
```
If `auto_evaluate_after_days > 0`, the factory will prompt you when a run is due even without this command.

## Architecture Overview
- **Factory Manager (SKILL.md):** Loads config, determines mode, routes each `task()` call to the right model with guardrails (timeouts, retries, artifact caps) and surfaces checkpoints.
- **Agent Team:** Product Manager → Architect & QA Sealed (parallel) → Lead Engineer → QA Validator → Outcome Evaluator. Agents are stateless and only receive what the orchestrator passes via the handoff manifest.
- **Isolation:** Every run lives in `.factory/runs/<run-id>` plus a hidden `.factory/sealed/<run-id>` folder. Aborting deletes both the worktree and the branch immediately.
- **State & Telemetry:** `state.json` persists mode, phase, artifacts, sealed hash, checkpoint decisions, and `evaluation_due_at`. SQLite tables (`factory_runs`, `phase_results`) enable reporting and future analytics.
- **Templates & Protocols:** Agents follow the markdown templates in `templates/` and the governance rules in `protocols/`, ensuring consistent artifacts (PRD, ARCH, SHADOW report, delivery summary, outcome report).

## Factory Operating Manual
### Sealed Test Lifecycle
1. **Authoring (Phase 2a or Express QA):** QA Sealed writes runnable tests using only PRD text or raw goals, capped at `max_artifact_lines`.
2. **Hashing:** The Factory Manager records a SHA-256 hash of every sealed file and stores it in `state.json`.
3. **Vault Storage:** Files live under `.factory/sealed/<run-id>` and are never copied into the worktree until validation.
4. **Execution:** During Phase 4 the sealed suite is temporarily copied into the worktree, executed, then deleted immediately after QA Validator reports the shadow score.
5. **Archive:** On delivery approval, the sealed files plus PRD/ARCH/SHADOW reports are archived under `.factory/archive/<run-id>` for future outcome evaluations.

### State File Anatomy
| Key | Meaning | Example |
|-----|---------|---------|
| `run_id` | Unique identifier for the current build | `run-20260401-1215` |
| `mode` | `full` or `express` | `full` |
| `current_phase` | Phase index (0–6) | `3` |
| `sealed_hash` | Integrity check for hidden tests | `sha256:d3b1...` |
| `checkpoints` | Map of checkpoint decisions keyed by checkpoint number | `{ "1": { "status": "approved", ... } }` |

> **Checkpoint entry format** (see [`protocols/checkpoint-gate.md`](protocols/checkpoint-gate.md)): each entry is `{ "status": "approved", "feedback": null, "decided_at": "2026-02-23T21:35:00Z" }`. Status may be `approved`, `modified`, or `aborted`.
| `skip_all` | Whether checkpoints beyond the current one auto-approve | `false` |
| `evaluation_due_at` | Timestamp when Phase 7 should auto-trigger | `2026-04-08T13:00:00Z` |
| `artifacts` | Map of produced files (prd, arch, shadow_report) | `{ "prd": "PRD.md", ... }` |

### Quality Gates
- **Checkpoint approvals**: Human-signed at every `gates` entry; delivery checkpoint cannot be skipped.
- **Gap thresholds**: Teams often target `shadow_score <= 10%`. Exceeding 25% suggests spec/test misalignment.
- **Hardening limits**: Exceeding `max_hardening_cycles` triggers the continue/deliver/abort decision.
- **Outcome KPI score**: Anything under 70/100 in OUTCOME-REPORT.md triggers a follow-up action item.

### Operator Checklist
- [ ] Confirm `.factory/` is gitignored (see `.gitignore`).
- [ ] Keep agent prompts under 200 lines (`wc -l agents/*.md`).
- [ ] Update `catalog.yml` version whenever SKILL or agent prompts meaningfully change.
- [ ] Run `.github/workflows/validate.yml` locally (or via PR) before merging.
- [ ] Archive finished runs you care about; delete stale entries with `rm -rf .factory/archive/run-*`.
- [ ] Review [`docs/ADR.md`](docs/ADR.md) before proposing governance changes.

### Run Artifacts & Locations
| Artifact | Produced By | Stored In | Notes |
|----------|-------------|-----------|-------|
| `PRD.md` | Product Manager | Worktree root & archive | Trimmed to `max_prd_lines`. |
| `ARCH.md` | Architect | Worktree root & archive | Contains diagrams + contracts. |
| `SHADOW-REPORT.md` | QA Validator | Worktree root & archive | Records shadow score + failure table. |
| `FACTORY-REPORT.md` | Factory Manager | Worktree root | Delivery summary template. |
| Sealed tests | QA Sealed | `.factory/sealed/<run-id>` | Hidden until validation; hashed. |
| `OUTCOME-REPORT.md` | Outcome Evaluator | Worktree & archive | KPI + post-ship assessment. |

### Data Retention & Cleanup
- `.factory/runs/` should contain only active runs. Delivery/abort must delete the worktree and branch immediately.
- `.factory/archive/` feeds Phase 7; keep what you need, prune the rest.
- `state.json` is recreated for every run and may be deleted once the run is merged and archived.

## FAQ
1. **Does express mode skip QA?** No. QA Sealed still writes tests — it just uses the raw goal as its spec.
2. **Can I run different models per agent?** Yes, edit `config.yml.models.*`. Dark Factory reads it on every run.
3. **What if a task times out?** The Factory retries automatically up to `factory.max_retries`. After that it surfaces the error.
4. **Where do sealed tests live?** `.factory/sealed/<run-id>`. They are hashed in Phase 2 and copied into the worktree only when QA Validator runs them.
5. **How do I keep artifacts small enough?** Use the `max_prd_lines / max_artifact_lines` tunables; SKILL enforces them automatically and will re-run an agent if the cap is exceeded.
6. **When is Phase 7 triggered automatically?** If `auto_evaluate_after_days` > 0, `dark factory status` or `resume` checks for due runs and launches the Outcome Evaluator.
7. **Can sealed tests ever be revealed?** Only after delivery, inside archived artifacts for outcome evaluation — never to builders mid-run.
8. **What’s the “Lights Out” codename about?** It reflects the goal: build in the dark (sealed tests) until the final delivery checkpoint flips the lights back on.

## Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `fatal: worktree add` fails | Dirty git state/untracked files | Commit/stash changes, ensure `.factory/` is gitignored, rerun. |
| QA Sealed crashes citing “unknown stack” | Goal/PRD lacked tech hints | Add a “Technical Constraints” section or mention the runtime in the goal; rerun Phase 2. |
| SHADOW score stays >0 after 3 cycles | Hardening limit reached | Choose **continue-hardening** to reset the counter or **deliver-as-is** to surface outstanding failures. |
| `state.json` missing for resume | Worktree cleaned manually | Use `dark factory status` to list available runs; if none, restart from Phase 0. |
| Markdown lint fails in CI | Missing newline at EOF or long lines | Run `markdownlint '**/*.md' --ignore node_modules` locally. |
| YAML validation job fails | Syntax error in `config.yml` or `catalog.yml` | Run `python -c "import yaml; yaml.safe_load(open('config.yml'))"` to pinpoint the issue. |
| “Files referenced in catalog.yml do not exist” | Added/renamed prompt without updating catalog | Keep `SKILL.md` + agent file paths in sync with `catalog.yml`. |

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
