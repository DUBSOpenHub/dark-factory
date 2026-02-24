# Outcome Report

## Evaluation Summary

| Metric | Value |
|--------|-------|
| PRD Success Criteria Met | {N}/{M} ({percentage}%) |
| KPIs On Track | {N}/{M} |
| Overall Outcome Score | {score}/100 |
| Evaluation Date | {date} |
| Days Since Delivery | {N} |

## Success Criteria Scorecard

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| SC-1 | {criterion} | {✅ Met / ⚠️ Partial / ❌ Not Met} | {verification_method} |

## KPI Tracker

| KPI | Baseline | Target | Current | Status |
|-----|----------|--------|---------|--------|
| {kpi} | {baseline} | {target} | {measured} | {🟢/🟡/🔴} |

## Key Results Assessment

| KR | Target | Actual | Gap |
|----|--------|--------|-----|
| {key_result} | {target} | {actual} | {delta} |

## Functional Verification

- Open tests: {passed}/{total}
- Sealed tests: {passed}/{total}
- Regressions detected: {N}

## Findings

### What Worked
- {positive_finding}

### What Didn't
- {negative_finding}

### Recommendations
- {actionable_recommendation}

<!--
WORKED EXAMPLE:
# Outcome Report

## Evaluation Summary

| Metric | Value |
|--------|-------|
| PRD Success Criteria Met | 7/8 (87.5%) |
| KPIs On Track | 2/3 |
| Overall Outcome Score | 88/100 |
| Evaluation Date | 2026-02-24 |
| Days Since Delivery | 1 |

## Success Criteria Scorecard

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| SC-1 | CLI prints correct fizzbuzz sequence | ✅ Met | Ran `python -m fizzbuzz 1 20` and verified output |
| SC-2 | Invalid input returns non-zero exit code | ⚠️ Partial | Negative numbers handled, non-integers show usage but exit code is 0 |

## KPI Tracker

| KPI | Baseline | Target | Current | Status |
|-----|----------|--------|---------|--------|
| Runtime (n=1e6) | N/A | < 0.1s | 0.03s | 🟢 |
| Memory | N/A | < 50MB | 8MB | 🟢 |
| Docs completeness | N/A | README + help | README present | 🟡 |

## Recommendations
- Fix exit code on non-integer input
- Add `--help` examples to README
-->
