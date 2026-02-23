# Sealed-Envelope Gap Analysis Report

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

## Gap Score: {percentage}%

```
Gap = sealed_failures / sealed_total × 100

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
