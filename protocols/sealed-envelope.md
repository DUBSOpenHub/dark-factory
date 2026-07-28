# Sealed-Envelope Testing Protocol

> **Canonical specification:** [Shadow Score Spec](https://github.com/DUBSOpenHub/shadow-score-spec/blob/main/SPEC.md)
> Dark Factory is the reference **Level 4 (Adversarial Independence)** implementation.

## Purpose

The sealed-envelope protocol ensures that the quality assessment of factory-built code is
independent and unbiased. Tests are generated from the specification BEFORE code is written,
building agents NEVER see them, and — at Level 4 — the tests and the code come from
**different model families**.

## The Two Axes of Independence

Level 1–3 of the spec address only the first axis. Level 4 adds the second.

| Axis | Question | Mechanism |
|------|----------|-----------|
| **Information** | Can the builder *see* the tests? | Vault outside the repo, disposable verify worktree, failure-messages-only hardening |
| **Correlation** | Does the builder *think like* the test author? | Seal author and implementer must be different model families |

Information isolation alone was a complete theory of independence when there was effectively
one frontier model. It is no longer sufficient. Two instances of the same model family share
training data, reasoning priors, and **failure modes**: if the builder's family doesn't think
to test something, it also doesn't think to handle it. The sealed test never fires, the score
reads 0%, and the defect ships with a green light.

See [`model-independence.md`](model-independence.md) for the full argument.

## How It Works

### Step 1: Seal Generation (Phase 2a)

After the PRD is approved, **N independent QA Sealed agents** — each from a different model
family, per `config.seal_plurality.authors` — each:

1. Receive ONLY `PRD.md` (or raw goal text in express mode) — never code, never `ARCH.md`,
   never each other's tests
2. Optionally receive **known blind spots** for this stack, carried forward from prior runs
3. Generate behavioral test cases tagged by category:
   - `happy_path` — expected inputs produce expected outputs
   - `edge_case` — boundary conditions, empty inputs, max values, unicode
   - `error_handling` — invalid inputs, missing data, malformed requests
   - `security` — injection, overflow, unauthorized access, data leakage
4. Write test files to `<config.isolation.vault_dir>/<run-id>/suite-<i>/`

The orchestrator then computes SHA-256 per suite plus a combined hash, stores them in
`state.json` and the `sealed_suites` table as tamper evidence, and destroys each agent's
context.

**The vault lives outside the repository.** `.factory/sealed/` sat inside the builder's world,
reachable by its unscoped `bash`/`glob`/`grep` tools; the only thing preventing access was a
politely-worded prompt. Isolation must be a property of filesystem topology, not of prompt
wording.

### Step 2: Spec-Ambiguity Gate (Phase 2.5a)

Because the suites are independent, their **disagreement is diagnostic**:

- **Agreement** → the specification is unambiguous. Union the suites into one envelope,
  deduplicating by behavior and keeping the strictest assertion.
- **Contradiction** → two frontier models from different families read the same specification
  and reached opposite conclusions about correct behavior. **The specification is defective.**

```text
spec_ambiguity = contradictory_criteria / total_criteria_covered
```

Breaching `config.autonomy.gates.spec_ambiguity_max` stops the line **before implementation
begins**. This catches the most expensive defect class in software — *building the wrong thing
correctly* — for the price of one extra dispatch of a cheap model.

### Step 3: Building Phase (Phase 3)

The Engineer agent:

- Works in the build worktree: `.factory/runs/<run-id>/`
- Is from a family that authored **none** of the sealed suites
- Has no filesystem path to the vault
- Writes its OWN test suite ("open tests")
- Does not know what scenarios the sealed tests cover

### Step 4: Validation (Phase 4)

1. Recompute every suite hash and compare against `state.json`. Mismatch → **seal tampering**:
   Shadow Score is INVALID and the run aborts.
2. Check the canary file's access time. A read → **seal break**: Shadow Score INVALID.
3. Commit the builder's work and create a **disposable verify worktree** from that commit.
4. Copy sealed tests into the *verify* worktree — never into the builder's.
5. Run BOTH suites.
6. Compute Shadow Score: `sealed_failures / sealed_total × 100`
7. Produce `SHADOW-REPORT.md` **and** `SHADOW-REPORT.json`
   (see `templates/shadow-report-template.md`).
8. Destroy the verify worktree.

> **Divergence from Spec v1.0.0 §4.3:** the spec says *"copy sealed tests into the
> implementation workspace."* That instruction creates a race — a concurrent builder, a resumed
> run, or a retry can read them, and delete-after is not a guarantee. Level 4 supersedes it with
> the disposable verify worktree. `config.invariants.workspace_isolation: legacy` restores the
> old behavior and downgrades the reported isolation strength.

### Step 5: Hardening (Phase 5)

Hardening runs in both Full and Express modes when Shadow Score > 0%, climbing
`config.hardening.ladder`.

1. Engineer receives ONLY failure descriptions:
   `"test_edge_null_input FAILED: expected 400, got 500"`
2. Engineer does NOT see test code — at any rung, ever
3. Engineer receives the **already-ruled-out ledger** from prior cycles
4. Engineer fixes the root cause in the implementation
5. QA Validator re-runs in a **fresh** verify worktree each cycle
6. Repeat up to `config.hardening.max_cycles`; escalate to the user after

**Progressive disclosure.** The final rung may set `reveal: assertions`, releasing the failed
assertion text — still never the test body. This converts an unbounded guess into a solvable
problem at the last resort, without breaking the seal that produced the score.

**Family switching.** Rung 3 switches model family. After two failures the family likely has a
blind spot, and different priors see a different problem. The replacement must still avoid all
seal-author families, or the engineer starts sharing priors with the tests judging it — which
is teaching to the test through model correlation rather than through visibility.

## Shadow Score Interpretation

| Score | Level | Meaning |
|-------|-------|---------|
| 0% | ✅ `perfect` | Engineer's tests covered everything the sealed tests checked |
| 1–15% | 🟢 `minor` | Small blind spots — likely edge cases |
| 16–30% | 🟡 `moderate` | Some gaps — engineer missed meaningful scenarios |
| 31–50% | 🟠 `significant` | Major gaps — review the engineer's testing approach |
| >50% | 🔴 `critical` | Fundamental quality issues — consider re-running Phase 3 |

A score is only authoritative when `independence: "strong"`. Under
`config.invariants.on_violation: advisory`, every report is stamped **ADVISORY** and the score
is explicitly optimistically biased.

## Isolation Rules

1. QA Sealed agents receive: `PRD.md` (or raw goal) + optional blind-spot memory. Nothing else.
2. Seal authors never see each other's tests.
3. Engineer receives: `PRD.md` + `ARCH.md` + `ARCH-CRITIQUE.md`. Never sealed tests.
4. Engineer's family ≠ every seal author's family.
5. QA Validator receives: code + sealed tests + open tests (full access), in a disposable
   worktree.
6. During hardening, Engineer receives failure messages only — plus assertion text at the final
   rung if configured. Never test source.
7. Sealed tests are stored outside the repository, `chmod 700`, with a canary.
8. Sealed test contents are released only into `<archive_dir>/<run-id>/sealed/` after delivery
   approval — never to a builder mid-run.
9. The orchestrator enforces these boundaries. Agents cannot self-grant access, and prompts are
   not the enforcement mechanism.
