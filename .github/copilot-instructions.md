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

## Security — Secure Future Initiative (SFI)

When working in this repository, always apply these security principles:

- **Never commit secrets** — API keys, tokens, passwords, or connection strings must never appear in code or config files. Use environment variables or secret managers.
- **Validate all inputs** — Treat user input, API responses, and file contents as untrusted. Sanitize before use.
- **Dependency awareness** — Flag outdated or vulnerable dependencies when encountered. Prefer pinned versions.
- **Least privilege** — Request only the minimum permissions needed. Avoid broad OAuth scopes or wildcard IAM policies.
- **Secure defaults** — Default to HTTPS, encrypted storage, and authenticated endpoints. Opt-in to less secure options, never opt-out of secure ones.

## Responsible AI (RAI)

When generating or modifying code, content, or configurations:

- **Transparency** — When AI-generated content is user-facing, make it clear that AI was involved. Do not impersonate humans.
- **Fairness** — Avoid generating content that stereotypes, excludes, or discriminates based on protected characteristics.
- **Human oversight** — Recommend human review for high-stakes outputs (financial calculations, access control, health-related content).
- **Privacy** — Do not log, store, or transmit personal data beyond what the feature explicitly requires. Minimize data collection.
- **Reliability** — Include error handling and fallback behavior. Do not let AI failures cascade into silent data corruption.

## Accessibility (CLI)

Terminal output must be accessible to all users:

- **No color-only indicators** — Always pair color with text symbols (✓/✗, PASS/FAIL). Support NO_COLOR and FORCE_COLOR environment variables.
- **Screen reader compatibility** — Use clear, linear output. Avoid excessive spinner animations or cursor repositioning that confuses screen readers.
- **Readable output** — Use consistent formatting, adequate spacing, and avoid walls of text. Support --quiet and --verbose flags.
