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
  ├── agents/qa-validator.md      → Phase 4: runs sealed tests, shadow analysis
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
