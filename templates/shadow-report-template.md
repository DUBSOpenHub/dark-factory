# Sealed-Envelope Shadow Analysis Report

> **Format conforms to:** [Shadow Score Spec v1.0.0 §5](https://github.com/DUBSOpenHub/shadow-score-spec/blob/main/SPEC.md#5-reporting-format)

## Run Summary
- **Run ID**: {run_id}
- **Goal**: {goal}
- **Mode**: {full|express}
- **Timestamp**: {iso_timestamp}

## Test Results

### Sealed Tests (hidden from builders)
- Total: {N}
- Passed: {N} ✅
- Failed: {N} ❌

### Open Tests (written by engineer)
- Total: {N}
- Passed: {N} ✅
- Failed: {N} ❌

## Shadow Score: {percentage}%

_Last line of SHADOW-REPORT.md must include `SHADOW_SCORE: {percentage}%` so the orchestrator can parse it._

```
Shadow Score = sealed_failures / sealed_total × 100

  0%  ✅ Perfect — engineer's tests covered everything
 1-15% 🟢 Minor — small blind spots
16-30% 🟡 Moderate — some gaps in edge cases
31-50% 🟠 Significant — engineer missed important scenarios
 >50%  🔴 Critical — major quality concerns
```

## Sealed Test Failures (for hardening)

| # | Test Name | Expected | Actual | Failure Message |
|---|-----------|----------|--------|-----------------|
| 1 | {test_name} | {expected} | {actual} | {message_for_engineer} |

## Hardening Payload

Machine-readable failure summary for the Lead Engineer:
```
SEALED TEST FAILURES:
- test_name: expected <X>, got <Y>
- test_name: raised ErrorType("message")
```

When all sealed tests pass, use the zero-failure canonical form:
```
SEALED TEST FAILURES:
- none
```

> **Required:** The last line of SHADOW-REPORT.md must include `SHADOW_SCORE: {percentage}%` so the orchestrator can parse it.

## Coverage Comparison

| Category | Open Tests | Sealed Tests | Gap |
|----------|-----------|-------------|-----|
| Happy path | {N} | {N} | {delta} |
| Edge cases | {N} | {N} | {delta} |
| Error handling | {N} | {N} | {delta} |
| Security | {N} | {N} | {delta} |

## Recommendations
- {recommendation_1}
- {recommendation_2}

<!--
Example (filled in):
## Run Summary
- **Run ID**: run-20260401-1215
- **Goal**: Add license scanner CLI
- **Mode**: full
- **Timestamp**: 2026-04-01T12:55:00Z

## Test Results
### Sealed Tests
- Total: 18
- Passed: 16 ✅
- Failed: 2 ❌

### Open Tests
- Total: 12
- Passed: 12 ✅
- Failed: 0 ❌

## Shadow Score: 11.1%

## Sealed Test Failures
| # | Test Name | Expected | Actual | Failure Message |
| 1 | rejects_gpl_dependency | CLI exits 2 | exited 0 | GPL dependency not blocked |
| 2 | csv_report_includes_risk | CSV contains risk column | column missing | Report missing risk metadata |

## Coverage Comparison
| Category | Open Tests | Sealed Tests | Gap |
| Happy path | 6 | 6 | 0 |
| Edge cases | 3 | 5 | +2 |
| Error handling | 3 | 4 | +1 |
| Security | 0 | 3 | +3 |

## Recommendations
- Extend engineer-written tests to include GPL blocking.
- Add regression test for CSV risk column.
-->

<!--
WORKED EXAMPLE:
# Sealed-Envelope Shadow Analysis Report

## Run Summary
- **Run ID**: run-123
- **Goal**: Fibonacci Calculator
- **Mode**: express

## Test Results
### Sealed Tests
- Total: 5
- Passed: 4 ✅
- Failed: 1 ❌

## Shadow Score: 20%

## Sealed Test Failures
| # | Test Name | Expected | Actual | Failure Message |
|---|-----------|----------|--------|-----------------|
| 1 | test_negative_input | "Error" | "0" | Expected "Error" for input -1, got "0" |
-->
