# Contributing to 🏭 Dark Factory

Thanks for helping keep the factory lights out. This repo is a Copilot CLI skill (Markdown + YAML), so changes are mostly prompt and workflow edits.

## Core principles

1. **Sealed envelope is sacred:** QA Sealed must never see code; Lead Engineer must never see sealed tests.
2. **Config is the source of truth:** Tunables and model routing belong in `config.yml`.
3. **Just-right engineering:** No package.json/pyproject.toml; keep this repo prompt-only.
4. **200-line rule:** Keep each agent prompt under 200 lines.

## Workflow

1. Fork the repo and create a branch: `factory/<topic>`.
2. Make the smallest change required.
3. Update docs/templates when outputs change.
4. Run the playbooks in `docs/TESTING.md` (Full + Express at minimum).
5. Ensure CI validation would pass (see `.github/workflows/validate.yml`).
6. Open a PR and fill out `.github/PULL_REQUEST_TEMPLATE.md`.

## Modifying agents

- Change **one agent at a time** unless a change is strictly coupled.
- Prompts must declare explicit **inputs and outputs**.
- Never reference sealed directories from builder prompts.

## Reporting issues

- Use GitHub Issues with the provided templates.
- Security issues: follow `SECURITY.md` (do not open a public issue).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
