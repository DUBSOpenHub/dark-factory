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

## Calibration

> Does the Shadow Score predict real-world outcomes? This section is the only thing that
> answers that question, and it feeds Learning Loop C.

| Field | Value |
|-------|-------|
| Shadow Score at delivery | {x}% |
| Outcome Score now | {n}/100 |
| Escaped defects | {n} |
| Calibration | {✅ predictive \| ⚠️ optimistic \| ℹ️ pessimistic} |

| Signal | Reading |
|--------|---------|
| Low Shadow Score, low Outcome Score | ⚠️ **optimistic** — the sealed suite missed what mattered |
| High Shadow Score, high Outcome Score | ℹ️ **pessimistic** — the suite over-asserted on things users don't care about |
| Scores agree | ✅ **predictive** — the envelope is measuring the right thing |

### Escaped Defects

Every defect found after delivery is a defect the sealed suite failed to catch. Classify it —
the class determines who learns from it.

| # | Defect | Class | Routes to |
|---|--------|-------|-----------|
| 1 | {description} | {spec gap \| suite gap} | {Product Manager \| QA Sealed} |

| Class | Meaning | Learning target |
|-------|---------|-----------------|
| **spec gap** | The PRD never required the behaviour. Code and tests were both correct. | Product Manager memory — write the requirement next time |
| **suite gap** | The PRD required it; no sealed test asserted it. | QA Sealed blind-spot memory — assert this category next time |

Zero escaped defects with a 0% Shadow Score is the only combination that validates the
envelope. Any other pairing is information about how to build the *next* envelope.

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
