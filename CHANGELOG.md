# Changelog 🏭

All notable changes to the **Dark Factory** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-24

### Added

- **Core Pipeline:** 6-phase autonomous build system (Product Manager -> Architect -> QA Sealed -> Lead Engineer -> QA Validator -> Delivery).
- **Sealed-Envelope Testing:** Acceptance tests are generated from the PRD before implementation and kept hidden from the builder.
- **Modes:** Full (checkpoint-gated) and Express (fast run with one delivery checkpoint).
- **Outcome Evaluation:** Optional post-ship evaluation against PRD success criteria.
- **Configuration:** `config.yml` for model routing and factory tunables.
- **CI:** Validation workflow for YAML, markdown linting, prompt line counts, and catalog reference checks.
