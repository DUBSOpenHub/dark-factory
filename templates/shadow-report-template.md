# Shadow Report Template

> **Format conforms to:** [Shadow Score Spec v2.0 §5](https://github.com/DUBSOpenHub/shadow-score-spec/blob/main/SPEC.md)
> Produced by the QA Validator in Phase 4 and after every hardening cycle.
>
> **Two files are required for complete execution** when `config.reporting.emit_json` is true:
> `SHADOW-REPORT.md` (human) and `SHADOW-REPORT.json` (machine, carries the §5.2 required
> fields). The markdown is a rendering of the JSON, not a substitute for it.

---

## Markdown Format

```markdown
# Shadow Report

> Shadow Score Spec v{spec_version} — Level {conformance_level}
> {⚠️ ADVISORY banner if independence is "weak" — omit entirely if "strong"}

## Provenance

| Field | Value |
|-------|-------|
| Run ID | {run_id} |
| Independence | {strong \| weak} |
| Seal authors | {model} ({family}), {model} ({family}) |
| Implementer | {model} ({family}) |
| Sealed hash | sha256:{hash} |
| Cycle | {n} of {max} |

## Summary

| Metric | Value |
|--------|-------|
| Open Tests Run | N |
| Open Tests Passed | N |
| Open Tests Failed | N |
| Sealed Tests Run | N |
| Sealed Tests Passed | N |
| Sealed Tests Failed | N |
| **Shadow Score** | **X%** ({level}) |

Shadow Score = (sealed_failures / sealed_total) × 100
A score of 0% means the implementation fully satisfies the spec **as tested**.

## Coverage Comparison

| Category | Open | Sealed | Delta |
|----------|------|--------|-------|
| happy_path | N | N | N |
| edge_case | N | N | N |
| error_handling | N | N | N |
| security | N | N | N |

A large positive delta shows where the engineer's testing instinct diverged from the
specification. Security is the most common gap.

## Open Test Results
List of all open tests with PASS/FAIL status.

## Sealed Test Results
List of all sealed tests with PASS/FAIL status and category.

## Failure Details

For each FAILED sealed test:

### {test_name}
- **Category:** {happy_path \| edge_case \| error_handling \| security}
- **Expected:** what the test expected
- **Actual:** what the implementation produced
- **Error:** error message or traceback summary

## Trend
_Only when cycle > 0._

| Test | Cycle 1 | Cycle 2 | Cycle 3 | Assessment |
|------|---------|---------|---------|------------|
| {test_name} | FAIL (500) | FAIL (404) | FAIL (timeout) | ⚠️ Failing for a different reason each cycle — engineer is guessing, not converging |

## Hardening Payload
Machine-readable failure summary for the Lead Engineer:

    SEALED TEST FAILURES:
    - test_name: expected <X>, got <Y>
    - test_name: raised ErrorType("message")

```

Only complete sealed execution may produce these Shadow Report files and a numeric score. If
any sealed suite is incomplete or invalid, produce only `SHADOW-EXECUTION-ERROR.md`, listing
suite IDs and execution metadata. Do not include test names, assertions, source, or excerpts.
Do not write either Shadow Report file or a numeric score; end with `SHADOW_SCORE: INVALID`.

For complete execution, include per-suite evidence in `sealed_tests.suites`: suite ID, author
model/family, expected, discovered, executed, passed, failed, skipped, setup/collection/runner
errors, timeout, hash match, and `status: "complete"`. Aggregate counts are the sums across
suites. Assertion failures are valid executed results. Zero tests, skips, errors, timeouts,
hash/count mismatches, or unknown outcomes invalidate the score.

For complete execution, the last response line must be `SHADOW_SCORE: {percentage}%`.

---

## JSON Format

`SHADOW-REPORT.json`. Fields marked ✅ are **required** by Spec §5.2.

```json
{
  "shadow_score_spec_version": "2.0.0",
  "report": {
    "id": "run-20260728-1030",
    "timestamp": "2026-07-28T10:30:00Z",
    "specification": "PRD.md",
    "shadow_score": 11.1,
    "level": "minor",
    "conformance_level": 4,
    "sealed_hash": "sha256:a1b2c3d4",
    "independence": "strong",
    "seal_author_models": ["gpt-6-astra", "gemini-3.8-flash"],
    "seal_author_families": ["openai", "google"],
    "implementer_model": "claude-sonnet-5.5",
    "implementer_family": "anthropic",
    "workspace_isolation": "strict",
    "spec_ambiguity": 0.06,
    "seal_broken": false,
    "spec_truncated": false
  },
  "sealed_tests": {
    "total": 18,
    "passed": 16,
    "failed": 2,
    "suites": [
      {
        "suite_id": "suite-1",
        "author_model": "gpt-6-astra",
        "author_family": "openai",
        "expected": 9,
        "discovered": 9,
        "executed": 9,
        "passed": 8,
        "failed": 1,
        "skipped": 0,
        "setup_errors": 0,
        "collection_errors": 0,
        "runner_errors": 0,
        "timed_out": false,
        "hash_match": true,
        "status": "complete"
      },
      {
        "suite_id": "suite-2",
        "author_model": "gemini-3.8-flash",
        "author_family": "google",
        "expected": 9,
        "discovered": 9,
        "executed": 9,
        "passed": 8,
        "failed": 1,
        "skipped": 0,
        "setup_errors": 0,
        "collection_errors": 0,
        "runner_errors": 0,
        "timed_out": false,
        "hash_match": true,
        "status": "complete"
      }
    ]
  },
  "open_tests": {"total": 12, "passed": 12, "failed": 0},
  "failures": [
    {
      "test_name": "test_rejects_gpl_dependency",
      "category": "security",
      "expected": "CLI exits with code 2",
      "actual": "CLI exits with code 0",
      "message": "GPL dependency not blocked"
    }
  ],
  "coverage_comparison": {
    "happy_path": {"open": 6, "sealed": 6, "delta": 0},
    "edge_case": {"open": 3, "sealed": 5, "delta": 2},
    "error_handling": {"open": 3, "sealed": 4, "delta": 1},
    "security": {"open": 0, "sealed": 3, "delta": 3}
  },
  "hardening": {
    "cycles_completed": 1,
    "max_cycles": 4,
    "initial_shadow_score": 22.2,
    "final_shadow_score": 11.1,
    "hardening_velocity": 11.1
  }
}
```

### Required fields (§5.2)

| Field | Required | Notes |
|-------|----------|-------|
| `shadow_score_spec_version` | ✅ | From `config.reporting.spec_version` |
| `report.shadow_score` | ✅ | One decimal place |
| `report.level` | ✅ | Derived from score — never invented |
| `sealed_tests.total` / `.passed` / `.failed` | ✅ | |
| `failures[]` | ✅ | `test_name`, `expected`, `actual`, `message` |
| `report.sealed_hash` | RECOMMENDED | Tamper evidence |
| `report.independence` | ✅ (Level 4) | `strong` or `weak` |
| `report.seal_author_families` / `implementer_family` | ✅ (Level 4) | Provenance |
| `hardening.hardening_velocity` | ✅ (Level 3) | `(initial − final) / cycles` |
| `open_tests.*` | RECOMMENDED | |
| `coverage_comparison` | OPTIONAL | Turns a number into a diagnosis |

### Level mapping

| Score | `level` |
|-------|---------|
| 0% | `perfect` |
| 1–15% | `minor` |
| 16–30% | `moderate` |
| 31–50% | `significant` |
| >50% | `critical` |

---

## Example — Minor Gaps (11.1%)

```markdown
# Shadow Report

> Shadow Score Spec v2.0.0 — Level 4

## Provenance

| Field | Value |
|-------|-------|
| Run ID | run-20260728-1030 |
| Independence | strong |
| Seal authors | gpt-6-astra (openai), gemini-3.8-flash (google) |
| Implementer | claude-sonnet-5.5 (anthropic) |
| Cycle | 0 of 4 |

## Summary

| Metric | Value |
|--------|-------|
| Sealed Tests Run | 18 |
| Sealed Tests Passed | 16 |
| Sealed Tests Failed | 2 |
| **Shadow Score** | **11.1%** (minor) |

## Coverage Comparison

| Category | Open | Sealed | Delta |
|----------|------|--------|-------|
| happy_path | 6 | 6 | 0 |
| edge_case | 3 | 5 | 2 |
| error_handling | 3 | 4 | 1 |
| security | 0 | 3 | 3 |

The engineer wrote zero security tests. Both sealed failures are in categories the
engineer never considered — which is exactly the blind spot the envelope exists to expose.
```

---

## Example — Advisory (weak independence)

```markdown
# Shadow Report

> Shadow Score Spec v2.0.0 — Level 4

> ⚠️ **ADVISORY — seal author and implementer share the model family `anthropic`.**
> Correlated blind spots make this score optimistically biased. It is NOT authoritative.
> Set different families in `config.roles` and re-run for a trustworthy score.

## Summary

| Metric | Value |
|--------|-------|
| **Shadow Score** | **0.0%** (perfect) — ⚠️ advisory |
```

A 0% score under weak independence is precisely the case that looks best and means least.
