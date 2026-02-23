# Copilot Instructions — Dark Factory

This repository contains the **Dark Factory** Copilot CLI skill — an agentic build system that orchestrates specialist AI agents through a sealed-envelope testing pipeline.

## Key Concepts

- **Sealed-envelope testing**: QA agent generates tests from the PRD *before* code is written. Building agents never see these tests. The gap between builder tests and sealed tests measures build quality.
- **Checkpoint-gated pipeline**: Each phase runs autonomously, pausing for human approval at phase boundaries.
- **Git worktree isolation**: All building happens in an isolated worktree. Nothing touches the user's working directory until they approve.

## File Map

| File | Purpose |
|------|---------|
| `SKILL.md` | Factory Manager orchestrator prompt (the brain) |
| `catalog.yml` | Skill metadata for Copilot CLI registration |
| `config.yml` | Tunable settings (models, thresholds, checkpoints) |
| `agents/*.md` | Specialist agent prompts (product, arch, qa, eng) |
| `templates/*.md` | Structured output templates for agent artifacts |
| `protocols/*.md` | Reusable protocol definitions |

## Rules

1. **Never modify sealed test isolation** — the sealed directory must remain invisible to building agents
2. **Agents are stateless** — each `task()` call gets a clean context. Pass EXACTLY what the agent needs via the handoff manifest.
3. **State must survive crashes** — every phase transition writes to `state.json`
4. **Express mode must work** — quick tasks should complete in ~60 seconds with one checkpoint
5. **Keep agent prompts under 200 lines** — focused, not bloated
