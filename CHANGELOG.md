# Changelog 🏭

All notable changes to the **Dark Factory** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-02-24

### Added

- **Auto-Evolution Protocol (L6):** Factory autonomously improves its own agent prompts every 5 completed runs. Generates 3 mutations, benchmarks each via express builds with sealed testing, selects winner by gap score, applies with human approval (configurable). Full rollback support.
- **New SQL Table:** `prompt_mutations` tracks every mutation attempt, acceptance, and rollback.
- **New Commands:** `dark factory auto-evolve` (manual trigger), `dark factory rollback <agent>` (instant revert).
- **New Config Section:** `auto_evolve` with 8 tunables (frequency, variants, safety thresholds, approval gate).
- **Safety Invariants:** One-axis mutations, frontmatter preservation, 200-line enforcement, I/O contract locking, mandatory backup before mutate.

## [0.2.0] - 2026-02-24

### Added

- **Cost Tracking:** Per-phase cost estimation with model pricing reference. Delivery report includes total run cost summary.
- **Multi-Model QA Sealed:** Optional secondary model for sealed test generation (`config.diversity.qa_sealed_secondary`). Produces more diverse test coverage.
- **Fitness Scoring:** Track gap scores, cost, and speed per run. `dark factory fitness` surfaces model routing recommendations based on historical performance.
- **Express Micro-PRD:** Express mode generates a structured 5–15 line micro-PRD before dispatching agents, improving test and build quality for short goals.
- **Prompt Evolution Tracking:** Hash agent prompts per run, correlate with gap scores. `dark factory evolve` identifies best-performing prompt versions.
- **New SQL Tables:** `factory_fitness` for run quality tracking, `prompt_versions` for prompt-gap correlation.
- **New Commands:** `dark factory fitness` and `dark factory evolve`.
- **Config Sections:** `cost_tracking`, `diversity`, `fitness`, `express` added to `config.yml`.

## [0.1.0] - 2026-02-24

### Added

- **Core Pipeline:** 6-phase autonomous build system (Product Manager -> Architect -> QA Sealed -> Lead Engineer -> QA Validator -> Delivery).
- **Sealed-Envelope Testing:** Acceptance tests are generated from the PRD before implementation and kept hidden from the builder.
- **Modes:** Full (checkpoint-gated) and Express (fast run with one delivery checkpoint).
- **Outcome Evaluation:** Optional post-ship evaluation against PRD success criteria.
- **Configuration:** `config.yml` for model routing and factory tunables.
- **CI:** Validation workflow for YAML, markdown linting, prompt line counts, and catalog reference checks.
