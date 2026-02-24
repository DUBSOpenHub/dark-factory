# ADR — Why These Decisions? 🏭

This project is intentionally "just a skill" (Markdown + YAML). These short ADRs explain why the core design choices exist and what constraints they protect.

---

## ADR-0001: Sealed-envelope testing

**Decision:** Generate acceptance tests from the PRD before implementation and keep them hidden from the builder.

**Why:** The builder should not be able to optimize for the tests. Sealed tests measure spec coverage, not test memorization.

**Consequences:**

- QA Sealed must not see code.
- Lead Engineer must not see sealed tests.
- Hardening must use failure messages only.

---

## ADR-0002: Git worktree isolation

**Decision:** Build in an isolated git worktree under `.factory/runs/<run-id>`.

**Why:** Isolation prevents partially generated changes from contaminating the main working tree and makes "reject" safe.

**Consequences:**

- Delivery is a merge (approve) or teardown (reject).
- Worktree cleanup must be reliable.

---

## ADR-0003: Checkpoint gates (human-in-the-loop)

**Decision:** Pause after major phases using `ask_user`.

**Why:** Fully autonomous codegen can drift. Checkpoints give humans a chance to correct the spec, stop unsafe work, or go fully dark (skip-all) when appropriate.

**Consequences:**

- Phase 6 (delivery) checkpoint cannot be skipped.
- Checkpoints must be consistent and predictable.

---

## ADR-0004: Speed-stack model routing via config.yml

**Decision:** Route models per role (spec writers vs validators) using `config.yml`.

**Why:** Different roles have different cost/quality profiles. Config-driven routing makes this adjustable without prompt edits.

**Consequences:**

- Prompts must not hardcode model names.
- The orchestrator must pass `model=<config.models.*>` on every `task()` call.

---

## ADR-0005: Prompt size limits (the 200-line rule)

**Decision:** Keep each agent prompt under 200 lines.

**Why:** Smaller prompts are easier to audit, less contradictory, and cheaper to iterate. Complexity should live in the orchestrator, not in a single agent prompt.

**Consequences:**

- Split responsibilities if prompts grow.
- CI enforces the limit.
