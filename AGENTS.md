# AGENTS.md — Working Guide for AI Agents

This file tells any AI agent how to work effectively on the Dark Factory codebase.

---

## Architecture

Dark Factory is a **Copilot CLI skill** that orchestrates 6 specialist agents through a checkpoint-gated pipeline with sealed-envelope testing.

```
SKILL.md (Factory Manager / Orchestrator)
  ├── agents/product-mgr.md       → Phase 1: writes PRD.md
  ├── agents/architect.md         → Phase 2b: writes ARCH.md
  ├── agents/qa-sealed.md         → Phase 2a: writes sealed tests (parallel with arch)
  ├── agents/lead-eng.md          → Phase 3: writes code + open tests
  ├── agents/qa-validator.md      → Phase 4: runs sealed tests, gap analysis
  └── agents/outcome-evaluator.md → Phase 7: evaluates post-ship outcomes
```

Each agent is called via `task()` with explicit inputs. Agents are stateless — they receive ONLY what the handoff manifest specifies.

---

## File Ownership Map

| File/Dir | Owner | Change Rules |
|----------|-------|-------------|
| `SKILL.md` | Orchestrator logic | Most critical file. Changes affect all phases. |
| `agents/*.md` | Individual agent prompts | Change one agent at a time. Test with a factory run. |
| `agents/outcome-evaluator.md` | Post-ship analysis prompt | Keep KPI math aligned with PRD template + config `outcome_evaluation` settings. |
| `config.yml` | User-tunable settings | Never hardcode values that belong here. |
| `templates/*.md` | Output format templates | Keep in sync with agent prompts that reference them. |
| `protocols/*.md` | Reusable protocol defs | Referenced by SKILL.md and agent prompts. |
| `catalog.yml` | Skill metadata | Update version on every release. |

---

## Before You Change Anything

1. Read the file you're changing completely
2. Understand which phase it affects
3. Check if templates or protocols reference it
4. Make the smallest possible change

---

## Agent Prompt Rules

Each agent prompt in `agents/` follows this structure:

```markdown
---
name: agent-id
description: What this agent does
tools:
  - tool1
  - tool2
---

# Role

You are {role}. You {responsibility}.

## Input

You will receive: {exact list of inputs}

## Output

You must produce: {exact output format}

## Rules

1. {constraint}
2. {constraint}
```

**Constraints for all agents:**
- Keep under 200 lines
- List tools explicitly in frontmatter
- Specify exact input/output contracts
- Never reference files outside the handoff manifest

---

## The Sealed-Envelope Rule (CRITICAL)

The QA Sealed agent (`agents/qa-sealed.md`) and the Lead Engineer agent (`agents/lead-eng.md`) must NEVER have access to each other's outputs:

- QA Sealed receives: PRD.md only
- Lead Engineer receives: PRD.md + ARCH.md only (never sealed tests)
- QA Validator receives: everything (code + sealed tests + open tests)

If you break this isolation, the entire sealed-envelope protocol is compromised.

---

## Common Pitfalls

### 1. Passing too much context to agents
Each `task()` call has a context window limit. Pass ONLY what the handoff manifest specifies. Don't dump entire files if the agent only needs a summary.

### 2. Forgetting state.json updates
Every phase transition must write to state.json. If you add a new phase or modify phase logic, update the state management code.

### 3. Hardcoding models
Model selection comes from `config.yml`. Don't hardcode `claude-sonnet-4.6` in agent prompts — the orchestrator handles model routing.

### 4. Breaking express mode
Express mode skips Phases 1-2. If you add logic that depends on PRD.md or ARCH.md existing, gate it behind a mode check.

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
