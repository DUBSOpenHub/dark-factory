# Copilot Instructions — Dark Factory

This repository contains **Dark Factory**, a GitHub Copilot CLI skill that orchestrates an agent pipeline with **sealed-envelope testing**.

## File map

| File/Dir | Purpose |
|---|---|
| `SKILL.md` | Factory Manager orchestrator prompt (the brain) |
| `agents/*.md` | Specialist agent prompts |
| `templates/*.md` | Artifact output formats |
| `protocols/*.md` | Protocol invariants (sealed envelope, checkpoints) |
| `config.yml` | Tunables (models, thresholds, timeouts) |
| `catalog.yml` | Skill metadata + file references |
| `docs/TESTING.md` | Playbooks + QA checklist |
| `docs/ADR.md` | Why these decisions |

## Non-negotiables

1. **Sealed envelope is sacred.** The Lead Engineer must never see sealed tests; the QA Sealed agent must never see code.
2. **Config is the source of truth.** Never hardcode model names or tunables inside prompts.
3. **Agent prompts <= 200 lines.** If a prompt grows, split responsibilities instead.
4. **Just a skill.** Do not add runtime code, package managers, telemetry, dashboards, or plugin systems.
5. **Worktree isolation.** All build work happens under `.factory/` until delivery approval.

## Prohibited actions

- Exposing sealed test contents to the user before Phase 4.
- Passing sealed test source code into any builder/hardening prompt.
- Editing user files outside the factory worktree.

## PR requirements

Before opening a PR:

- Run Playbook 1 (Full) and Playbook 2 (Express) from `docs/TESTING.md`.
- Ensure `catalog.yml` references are valid.
- Ensure YAML parses (`config.yml`, `catalog.yml`).
- Ensure CI validate workflow passes.
