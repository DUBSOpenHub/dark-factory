# Copilot Instructions — Dark Factory

This repository contains **Dark Factory**, a GitHub Copilot CLI skill that orchestrates an agent pipeline with **sealed-envelope testing** and **cross-family model independence** (Shadow Score Spec v2.0, Level 4 — Adversarial Independence).

## File map

| File/Dir | Purpose |
|---|---|
| `SKILL.md` | Factory Manager orchestrator prompt (the brain) |
| `agents/*.md` | 8 specialist agent prompts |
| `templates/*.md` | Artifact output formats |
| `protocols/sealed-envelope.md` | Isolation invariants |
| `protocols/model-independence.md` | Why cross-family separation is required |
| `protocols/checkpoint-gate.md` | Autonomy modes + quality gates |
| `config.yml` | Tunables (invariants, families, capabilities, roles, gates, thresholds) |
| `catalog.yml` | Skill metadata + file references |
| `.github/scripts/validate_conformance.py` | Level 4 conformance check (CI) |
| `docs/TESTING.md` | Playbooks + QA checklist |
| `docs/ADR.md` | Why these decisions |

## Non-negotiables

1. **Sealed envelope is sacred.** The Lead Engineer must never see sealed tests; the QA Sealed agent must never see code. Isolation is filesystem topology (vault outside the repo, disposable verify worktree), not prompt wording.
2. **Model independence is sacred.** Seal author and implementer must be in different families. Same-family pairing biases every Shadow Score toward 0% — it overclaims quality. Phase 0 aborts on violation.
3. **Config is the source of truth.** Never hardcode model names or tunables inside prompts.
4. **Agent prompts <= 200 lines.** If a prompt grows, split responsibilities instead.
5. **Just a skill.** Do not add runtime code, package managers, telemetry, dashboards, or plugin systems. The one exception is `.github/scripts/validate_conformance.py`, which runs in CI only and must stay dependency-light.
6. **Worktree isolation.** All build work happens under `.factory/` until delivery approval.
7. **Delivery is always human-approved**, in every autonomy mode including `dark`.

## Prohibited actions

- Exposing sealed test contents to the user before Phase 4.
- Passing sealed test source code into any builder/hardening prompt.
- Leaking test source, function names, or fixtures through `AMBIGUITY.md`.
- Reporting a Shadow Score without `independence` and `seal_author_families` provenance.
- Passing `reasoning_effort` or `context_tier` to a model that does not support it — check `config.model_capabilities` and omit.
- Editing user files outside the factory worktree.

## PR requirements

Before opening a PR:

- Run Playbook 1 (Full) and Playbook 2 (Express) from `docs/TESTING.md`.
- Run `python3 .github/scripts/validate_conformance.py`.
- Ensure `catalog.yml` references are valid and every `agents/*.md` is listed.
- Ensure YAML parses (`config.yml`, `catalog.yml`).
- Ensure CI validate workflow passes.
