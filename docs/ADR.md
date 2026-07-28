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

> **Amended by ADR-0010.** Checkpoints remain the default, but they are no longer the only
> control surface: `autonomy: dark` replaces phase-boundary prompts with threshold gates.
> Delivery approval is still non-negotiable.

---

## ADR-0004: Speed-stack model routing via config.yml

**Decision:** Route models per role (spec writers vs validators) using `config.yml`.

**Why:** Different roles have different cost/quality profiles. Config-driven routing makes this adjustable without prompt edits.

**Consequences:**

- Prompts must not hardcode model names.
- The orchestrator must pass `model=<config.roles.*.model>` on every `task()` call.

---

## ADR-0005: Prompt size limits (the 200-line rule)

**Decision:** Keep each agent prompt under 200 lines.

**Why:** Smaller prompts are easier to audit, less contradictory, and cheaper to iterate. Complexity should live in the orchestrator, not in a single agent prompt.

**Consequences:**

- Split responsibilities if prompts grow.
- CI enforces the limit.

---

## ADR-0006: Cross-family model independence

**Decision:** The seal author and the implementer MUST come from different model families. Enforced at Phase 0 (abort) and in CI.

**Why:** v0.1.0 assigned `claude-sonnet-4.6` to *both* `qa_sealed` and `lead_eng` — the same model family on both sides of a test designed to measure independence.

Information isolation answers "can the builder **see** the tests". It does not answer "does the builder **think like** the test author". Two instances of one family share training data, reasoning priors, and therefore **failure modes**. If the family doesn't think to test Unicode homographs, it also doesn't think to normalise them: the sealed test is never written, the code is never hardened, the score reads 0%, and the bug ships with a green light.

The bias is not random. It always points toward 0% — the system **overclaims** quality precisely when it is least entitled to.

**Consequences:**

- `config.families` maps every model to a family; `config.invariants.cross_family_required` enforces separation.
- A same-family config aborts the run. With `on_violation: warn`, the report is stamped ⚠️ ADVISORY and is explicitly non-authoritative.
- Not all pairings are equally bad. PM == seal author biases the score *upward* (conservative), so it is allowed but must be disclosed. See `protocols/model-independence.md`.
- Cross-family routing constrains the hardening ladder: escalation must increase **diversity**, not just raw capability.

---

## ADR-0007: Seal plurality

**Decision:** Author N independent sealed suites from N different model families (default 2), then merge them into one envelope.

**Why:** One sealed suite tells you whether the code is right. Two independent sealed suites tell you whether the **specification** is right. Where two families read the same PRD and write *contradictory* assertions, at least one of them inferred something the spec never stated — that is a measurable property, `spec_ambiguity`, and no single-suite design can produce it.

**Consequences:**

- Higher cost per run (N sealed authors instead of 1). Set `seal_plurality.enabled: false` and `invariants.seal_plurality_min: 1` to opt out.
- Requires a contradiction/divergence distinction: divergence is the healthy coverage dividend, contradiction is the ambiguity signal.
- `AMBIGUITY.md` must name disputed *behaviours* without revealing test source — the Lead Engineer reads it.

---

## ADR-0008: Disposable verify worktree

**Decision:** Never copy sealed tests into the builder's workspace. Create a throwaway worktree from the builder's commit, run both suites there, then destroy it.

**Why:** Shadow Score Spec v1.0.0 §4.3 says to copy sealed tests into the implementation workspace at validation time. That was acceptable when validation was terminal, but Dark Factory hardens in a loop: after cycle 1 the sealed tests are sitting in a directory the builder can `grep`. The Lead Engineer has unscoped `bash`, `glob`, and `grep`. Isolation enforced by prompt wording is not isolation.

The vault also moved out of the repo entirely (`~/.factory-vault/`), because `.factory/sealed/` lived inside the builder's own world.

**Consequences:**

- Deliberate divergence from Spec v1.0.0 §4.3, documented in `protocols/sealed-envelope.md`. `invariants.workspace_isolation: legacy` restores the old behaviour.
- A canary file in the vault gives tamper evidence: an atime change sets `seal_broken: true`.
- Slightly more git plumbing per validation cycle. Worth it.

---

## ADR-0009: Multi-turn hardening

**Decision:** Phase 5 continues the **same** engineer agent via `write_agent` instead of dispatching a fresh agent per cycle.

**Why:** A fresh agent re-derives the codebase from scratch every cycle and re-tries approaches it already ruled out. Keeping the agent alive preserves the ruled-out ledger, so each cycle starts where the last one ended.

**Consequences:**

- Effort and model escalate along `config.hardening.ladder` — but the ladder may never select a seal author's family.
- The final rung may `reveal: assertions` (failing assertions only, never suite source) as a last resort before escalation.
- `initial_shadow_score` must be recorded before cycle 1, otherwise `hardening_velocity` — a Level 3 conformance requirement — is uncomputable. v0.1.0 stored only the final score and therefore could not have earned the Level 3 badge it displayed.

---

## ADR-0010: Autonomy gates over approval prompts

**Decision:** Replace unconditional human checkpoints with automated threshold gates that escalate only on breach. Human checkpoints remain available and remain the default.

**Why:** "Lights Out" that stops for a human five times per run is a supervised assembly line with the foreman watching. Autonomy should mean **autonomous with evidence**, not autonomous with permission.

**Consequences:**

- `autonomy: dark` runs end-to-end; gates still fire, and Phase 6 delivery still requires a human in every mode.
- A gate breach must print the measured value, the threshold, and the specific findings. A breach that cannot explain itself is not actionable.
- Gate results persist to `state.json` and SQL so a run nobody watched is still auditable.

---

## ADR-0011: Red team after the seal opens

**Decision:** Run a `security-review` agent in Phase 4.5, after the Shadow Score is computed.

**Why:** The sealed suite asks "does it do what the spec says". The red team asks "what else does it do". A perfect 0% Shadow Score says nothing about a path-traversal bug the PRD never thought to forbid.

**Consequences:**

- Findings must be classified **spec gap** vs **implementation bug**. Spec gaps route to the Product Manager (the requirement is the defect); implementation bugs route to hardening. Misclassifying sends the engineer to fix code that is already correct.
- Runs after the seal opens, so the red team may read everything.

---

## ADR-0012: Tournament mode

**Decision:** Optionally have N cross-family competitors implement the same PRD, graded by the same envelope.

**Why:** Model selection is otherwise folklore. A sealed envelope written before any competitor starts is an unbiased grader, so the comparison is evidence rather than preference.

**Consequences:**

- Competitors may not share a family with any seal author, or the tournament measures family affinity instead of capability.
- The failure-overlap table is the real output: when *every* competitor fails the same test, that is a specification defect, not a model weakness — and no amount of model swapping fixes it.
- `selection: pareto` reports the non-dominated (score, cost) set instead of a single winner.

---

## ADR-0013: Cross-run learning loops

**Decision:** Query prior runs via `session_store_sql` to seed blind-spot memory (Loop A), route roles empirically (Loop B), and calibrate the score against real outcomes (Loop C).

**Why:** A factory that scores identically on run 1 and run 100 has learned nothing. Escaped defects are the highest-value signal the system produces and were previously discarded.

**Consequences:**

- Loop B routing overrides must re-check every Phase 0 invariant after being applied.
- Loop C requires the Outcome Evaluator to classify escaped defects as spec gap vs suite gap — the class determines which agent's memory learns from it.
- This adds no runtime system: it reads the CLI's existing session store and adds columns to tables that already existed.
