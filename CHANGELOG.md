# Changelog 🏭

All notable changes to the **Dark Factory** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-28

Dark Factory v1.0 targets **Shadow Score Spec v2.0 — Level 4 (Adversarial Independence)**.

The headline change: v0.1.0 assigned the same model (`claude-sonnet-4.6`) to both `qa_sealed`
and `lead_eng` — the same model family on both sides of a test designed to measure
independence. Hiding the tests answers *"can the builder see them"*; it does not answer *"does
the builder think like the test author"*. Correlated blind spots mean the sealed test is never
written, the score reads 0%, and the bug ships green. **The bias always points toward
overclaiming quality.** v1.0 makes cross-family separation a machine-checked invariant.

### Added

- **Model independence invariants.** `config.invariants.cross_family_required` — seal author
  and implementer must be different model families. Enforced at Phase 0 (abort) and in CI.
  Bias direction is respected: pairings that bias the score *upward* are conservative and
  allowed with disclosure; pairings that bias it *downward* are forbidden.
- **`config.families` + `config.model_capabilities`.** Every model maps to a family, and to the
  `reasoning_effort` / `context_tier` values it actually accepts. Unsupported parameters are
  **omitted**, never defaulted — several models accept no effort parameter at all.
- **Seal plurality (Phase 2a).** N sealed suites authored independently by N families. One
  suite grades the code; two independent suites grade the **specification**.
- **Spec ambiguity gate (Phase 2.5a).** `AMBIGUITY.md` measures contradictions between sealed
  suites. Where two families read the same PRD and assert opposite behaviour, the spec is
  ambiguous — caught before a line of code is written. Distinguishes contradiction (ambiguity
  signal) from divergence (the healthy coverage dividend of plurality).
- **Arch Critic (Phase 2.5b).** A `rubber-duck` agent from a different family than the
  architect reviews `ARCH.md` **before** implementation, with a full requirement-coverage walk.
- **Red Team (Phase 4.5).** A `security-review` agent attacks what the spec forgot, after the
  seal opens. Findings are classified **spec gap** vs **implementation bug** — the class
  determines whether the PM or the engineer learns from it.
- **Tournament mode.** N cross-family competitors, one shared envelope written before any of
  them starts. The failure-overlap table is the real product: when every competitor fails the
  same test, that is a specification defect no model swap can fix. `pareto` selection reports
  the non-dominated (quality, cost) set.
- **Autonomy gates.** `dark` / `supervised` / `manual` modes. Threshold gates on spec
  ambiguity, architecture severity, Shadow Score, red-team findings, and cost — each printing
  the measured value, the threshold, and the specific evidence on breach.
- **Cross-run learning.** Loop A (blind-spot memory), Loop B (empirical routing by measured
  score), Loop C (calibration of Shadow Score against post-ship outcomes) via
  `session_store_sql`.
- **Cost tracking.** Token and dollar cost per phase in `phase_results`, plus a cost ceiling
  gate. Without it, every tunable in `config.yml` is a guess that can never be validated.
- **`SHADOW-REPORT.json`.** Machine-readable output carrying the Spec §5.2 required fields
  plus provenance (`independence`, `seal_author_families`, `implementer_family`), so scores are
  comparable across tools instead of regex-scraped out of prose.
- **`hardening_velocity`.** `(initial − final) / cycles`, a Level 3 conformance requirement
  that was previously **uncomputable** because only the final score was stored.
- **`.github/scripts/validate_conformance.py`.** Ten Level 4 checks wired into CI, plus new CI
  steps verifying every agent is catalogued and every `SKILL.md` reference resolves.
- **New protocols:** `model-independence.md`. **New templates:** shadow report, arch critique,
  red team, ambiguity report, tournament report.
- **New ADRs:** 0006–0013 covering independence, plurality, verify worktree, multi-turn
  hardening, autonomy gates, red team, tournament, and learning loops.

### Changed

- **Sealed tests are never copied into the builder's workspace.** Validation now runs in a
  disposable worktree created from the engineer's commit and destroyed immediately after. A
  deliberate divergence from Spec v1.0.0 §4.3, which was safe only when validation was
  terminal — Dark Factory hardens in a loop, so the tests would sit in a directory the builder
  can `grep`. Set `invariants.workspace_isolation: legacy` to restore the old behaviour.
- **The vault moved outside the repository** to `~/.factory-vault/`, with a canary file for
  tamper evidence. `.factory/sealed/` lived inside the builder's own worktree, and the builder
  has unscoped `bash`/`glob`/`grep`. Isolation must be filesystem topology, not prompt wording.
- **Hardening is multi-turn.** Phase 5 continues the *same* engineer agent via `write_agent`
  instead of dispatching a fresh one per cycle, preserving the ruled-out ledger. The escalation
  ladder raises effort, then model, then **family** — identical retries are rerolling, not
  hardening.
- **Progressive disclosure.** The final hardening rung may reveal failing *assertions* (never
  test source), turning an unbounded guess into a solvable problem without breaking the seal.
- **`safety.summarize_artifacts` now defaults to `false`** and the line caps are emergency
  backstops (2000/5000). With long-context tiers, routine summarisation lossy-compresses the
  contract both the tests and the code derive from — the Shadow Score ends up measuring the
  summariser. Acceptance criteria always pass through verbatim.
- **Express detection uses a classifier**, not word count. `"refactor auth to use OAuth2 with
  PKCE"` is eight words and is emphatically not an express task.
- **`premium` is now per-role.** A single `premium_model` applied to every role collapses the
  pipeline into one family and silently voids the Shadow Score. Premium raises capability
  *within* each role's family.
- **Purpose-built agent types** replace blanket `general-purpose` dispatch: `rubber-duck` for
  the Arch Critic, `security-review` for the Red Team, `task` for the QA Validator, `explore`
  for complexity triage.
- `config.models.*` → `config.roles.*` with per-role `reasoning_effort` and `context_tier`.
- Agent count 6 → 8; `catalog.yml` version → 1.0.0.

### Fixed

- **Runtime-breaking filename mismatch.** `agents/qa-validator.md` wrote `GAP-REPORT.md` while
  `SKILL.md` read `SHADOW-REPORT.md`. Phase 5 extraction found nothing, the Phase 6 archive
  `cp` errored, and Phase 7 had no input. Residual `gap-score` naming from the incomplete
  `gap-score-spec` → `shadow-score-spec` rename is now gone from every file.
- **Unearned Level 3 badge.** The README claimed Level 3, but Spec §6 requires tracked
  hardening velocity, which the schema could not compute. Both the metric and the storage now
  exist.
- **Missing Spec §5.2 required fields.** Reports omitted `shadow_score_spec_version` and
  `level`.

## [0.1.0] - 2026-02-24

### Added

- **Core Pipeline:** 6-phase autonomous build system (Product Manager -> Architect -> QA Sealed -> Lead Engineer -> QA Validator -> Delivery).
- **Sealed-Envelope Testing:** Acceptance tests are generated from the PRD before implementation and kept hidden from the builder.
- **Modes:** Full (checkpoint-gated) and Express (fast run with one delivery checkpoint).
- **Outcome Evaluation:** Optional post-ship evaluation against PRD success criteria.
- **Configuration:** `config.yml` for model routing and factory tunables.
- **CI:** Validation workflow for YAML, markdown linting, prompt line counts, and catalog reference checks.
