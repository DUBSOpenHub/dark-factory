# AGENTS.md — Working Guide for AI Agents

This file tells any AI agent how to work effectively on the Dark Factory codebase.

---

## Architecture

Dark Factory is a **Copilot CLI skill** that orchestrates 8 specialist agents through a gate-driven pipeline with sealed-envelope testing and **cross-family model independence** (Shadow Score Spec v2.0, Level 4).

```
SKILL.md (Factory Manager / Orchestrator)
  ├── agents/product-mgr.md       → Phase 1: writes PRD.md
  ├── agents/qa-sealed.md         → Phase 2a: writes sealed tests (×N authors, parallel)
  ├── agents/architect.md         → Phase 2b: writes ARCH.md
  ├── agents/arch-critic.md       → Phase 2.5b: critiques ARCH.md before any code exists
  ├── agents/lead-eng.md          → Phase 3 + 5: writes code, open tests, hardening
  ├── agents/qa-validator.md      → Phase 4: runs both suites, computes Shadow Score
  ├── agents/red-team.md          → Phase 4.5: attacks what the spec forgot
  └── agents/outcome-evaluator.md → Phase 7: post-ship outcomes + calibration
```

Each agent is called via `task()` with explicit inputs. Agents are stateless — they receive ONLY what the handoff manifest specifies. Phase 5 is the exception: hardening continues the **same** agent via `write_agent`, so accumulated context is preserved across cycles.

---

## File Ownership Map

| File/Dir | Owner | Change Rules |
|----------|-------|-------------|
| `SKILL.md` | Orchestrator logic | Most critical file. Changes affect all phases. |
| `agents/*.md` | Individual agent prompts | Change one agent at a time. Test with a factory run. |
| `agents/outcome-evaluator.md` | Post-ship analysis prompt | Keep KPI math aligned with PRD template + config `outcome_evaluation` settings. |
| `config.yml` | User-tunable settings | Never hardcode values that belong here. Changing `roles` or `families` changes conformance — re-run the validator. |
| `templates/*.md` | Output format templates | Keep in sync with agent prompts that reference them. |
| `protocols/sealed-envelope.md` | Isolation invariants | Referenced by SKILL.md and agent prompts. |
| `protocols/model-independence.md` | Why Level 4 exists | The intellectual core. Read before touching `config.roles`. |
| `protocols/checkpoint-gate.md` | Autonomy + quality gates | Gate thresholds live in `config.gates`, not here. |
| `.github/scripts/validate_conformance.py` | CI conformance check | The only executable in the repo. Keep it dependency-light. |
| `catalog.yml` | Skill metadata | Update version on every release. Every `agents/*.md` must be listed. |

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
- Lead Engineer receives: PRD.md + ARCH.md + ARCH-CRITIQUE.md only (never sealed tests)
- QA Validator receives: everything (code + sealed tests + open tests)

Isolation is enforced by **filesystem topology**, not prompt wording: the vault lives outside the repo at `config.isolation.vault_dir`, and validation runs in a disposable worktree created from the engineer's commit. The engineer's own worktree never contains sealed tests at any point.

If you break this isolation, the entire sealed-envelope protocol is compromised.

---

## The Model-Independence Rule (EQUALLY CRITICAL)

Information isolation answers "can the builder **see** the tests". It does not answer "does the builder **think like** the test author".

**Seal author and implementer must be in different model families.** Same-family pairing means correlated blind spots: if the family doesn't think to test something, it also doesn't think to handle it — the sealed test never fires, the score reads 0%, and the bug ships green. The bias always points toward 0%, i.e. it **overclaims** quality.

| Pair | If same family | Verdict |
|------|----------------|---------|
| Seal author == Implementer | Score too low → overclaims | ❌ forbidden |
| PM == Implementer | Builder infers unstated assumptions | ❌ forbidden |
| Arch Critic == Architect | Critic shares the designer's blind spots | ❌ forbidden |
| Red Team == Implementer | Attacker shares the builder's assumptions | ❌ forbidden |
| PM == Seal author | Score too high → conservative | ⚠️ allowed, must be disclosed |

Enforced at Phase 0 (runtime abort) **and** in CI (`.github/scripts/validate_conformance.py`). Read `protocols/model-independence.md` before changing `config.roles`.

---

## Common Pitfalls

### 1. Passing too much context to agents
Each `task()` call has a context window limit. Pass ONLY what the handoff manifest specifies. Don't dump entire files if the agent only needs a summary.

### 2. Forgetting state.json updates
Every phase transition must write to state.json. If you add a new phase or modify phase logic, update the state management code.

### 3. Hardcoding models
Model selection comes from `config.yml`. Don't hardcode model IDs in agent prompts — the orchestrator handles model routing, and hardcoding silently breaks the independence invariant.

### 4. Breaking express mode
Express mode skips Phases 1-2. If you add logic that depends on PRD.md or ARCH.md existing, gate it behind a mode check. Express skips **specification** phases, never quality gates.

### 5. Passing an unsupported parameter
Not every model accepts `reasoning_effort` or `context_tier` (`kimi-k2.7-code` and `claude-haiku-4.5` accept neither; several models have no `long_context` tier). Check `config.model_capabilities` and **omit** the parameter — never pass a default. CI validates every configured role against this map.

### 6. Adding an agent without cataloguing it
Every `agents/*.md` must appear in `catalog.yml` under `links.agents`. CI fails otherwise.

### 7. Reporting a Shadow Score without provenance
`SHADOW-REPORT.json` must carry `independence`, `seal_author_families`, and `implementer_family`. A score without provenance can't be trusted or reproduced, and a `weak` score must be stamped ADVISORY.
