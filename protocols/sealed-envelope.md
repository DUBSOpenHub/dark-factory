# Sealed-Envelope Testing Protocol

## Purpose

The sealed-envelope protocol ensures that the quality assessment of factory-built code is independent and unbiased. Tests are generated from the specification BEFORE code is written, and building agents NEVER see the sealed tests.

## How It Works

### Step 1: Seal Generation (Phase 2a)

After the PRD is approved (Phase 1 checkpoint), the QA Sealed agent:

1. Receives ONLY `PRD.md` — never code, never `ARCH.md`
2. Generates behavioral test cases covering:
   - Happy path scenarios
   - Edge cases and boundary conditions
   - Error handling and invalid inputs
   - Security scenarios (injection, overflow, unauthorized access)
3. Writes test files to `.factory/sealed/<run-id>/`
4. The orchestrator computes SHA-256 of the sealed directory
5. Hash is stored in `state.json` as tamper evidence
6. QA Sealed agent's context is destroyed — separate `task()` call, never reused

### Step 2: Building Phase (Phase 3)

The Engineer agent:
- Works in the worktree: `.factory/runs/<run-id>/`
- Has NO access to `.factory/sealed/<run-id>/`
- Writes their OWN test suite ("open tests")
- Does NOT know what specific scenarios the sealed tests cover

### Step 3: Validation (Phase 4)

The QA Validator agent:
1. Copies sealed tests from `.factory/sealed/<run-id>/` into the worktree
2. Runs BOTH test suites (sealed + open)
3. Computes Gap Score: `sealed_failures / sealed_total × 100`
4. Produces a gap analysis report (see `templates/gap-report-template.md`)

### Step 4: Hardening (Phase 5, if needed)

If Gap Score > 0%:
1. Engineer receives ONLY failure messages: `"test_edge_null_input FAILED: expected 400, got 500"`
2. Engineer does NOT see the test code
3. Engineer fixes the root cause in the implementation
4. QA Validator re-runs sealed tests
5. Repeat up to `max_hardening_cycles` (default: 3)
6. If still failing after max cycles → escalate to user

## Gap Score Interpretation

| Score | Level | Meaning |
|-------|-------|---------|
| 0% | ✅ Perfect | Engineer's tests covered everything the sealed tests checked |
| 1-15% | 🟢 Minor | Small blind spots — likely edge cases |
| 16-30% | 🟡 Moderate | Some gaps — engineer missed meaningful scenarios |
| 31-50% | 🟠 Significant | Major gaps — review engineer's testing approach |
| >50% | 🔴 Critical | Fundamental quality issues — consider re-running Phase 3 |

## Isolation Rules

1. QA Sealed agent receives: `PRD.md` ONLY
2. Engineer agent receives: `PRD.md` + `ARCH.md` ONLY (never sealed tests)
3. QA Validator receives: code + sealed tests + open tests (full access)
4. During hardening, Engineer receives: failure messages ONLY (not test code)
5. Sealed test files are stored OUTSIDE the build worktree
6. The orchestrator (SKILL.md) enforces these boundaries — agents cannot self-grant access
