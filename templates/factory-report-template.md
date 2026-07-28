# 🏭 Dark Factory — Delivery Report

> Produced in Phase 6. This is the artifact a human reads before approving a merge, so it
> must be complete enough to approve **without** re-reading the run.

```markdown
# 🏭 Dark Factory — Delivery Report

## Build Summary

| Field | Value |
|-------|-------|
| Run ID | {run_id} |
| Goal | {goal} |
| Mode | {full \| express \| tournament} |
| Autonomy | {dark \| supervised \| manual} |
| Duration | {total_time} |
| Phases completed | {N}/10 |
| Total cost | ${n} |

## Quality Assessment

### Sealed-Envelope Results

| Metric | Value |
|--------|-------|
| **Shadow Score** | **{x}%** ({level}) |
| Independence | {strong \| ⚠️ weak — advisory} |
| Seal authors | {model} ({family}), {model} ({family}) |
| Implementer | {model} ({family}) |
| Sealed tests | {passed}/{total} |
| Open tests | {passed}/{total} |
| Spec ambiguity | {n} |
| Initial Shadow Score | {x}% |
| Hardening cycles | {n} of {max} |
| Hardening velocity | {x} points per cycle |
| Seal integrity | {intact \| ⛔ BROKEN} |

`hardening_velocity = (initial_shadow_score − final_shadow_score) / cycles_completed`

A low velocity across several cycles means the engineer is guessing rather than converging.
That is a signal about the *specification*, not only about the code.

### Gates

| Gate | Value | Threshold | Status |
|------|------:|----------:|--------|
| Spec ambiguity | {n} | {n} | {✅ \| ⛔} |
| Arch critique | {severity} | {severity} | {✅ \| ⛔} |
| Shadow Score | {x}% | {x}% | {✅ \| ⛔} |
| Red team (high) | {n} | {n} | {✅ \| ⛔} |
| Cost | ${n} | ${n} | {✅ \| ⛔} |

### Red Team

| Severity | Count |
|----------|------:|
| high | {n} |
| medium | {n} |
| low | {n} |

Findings classified as **spec gap** are defects in the PRD, not the code, and are routed to
the Product Manager rather than to hardening.

## Artifacts Produced

| File | Type | Lines |
|------|------|-------|
| {path} | {code \| test \| doc \| config} | {N} |

## Agent Performance

| Agent | Phase | Model | Family | Effort | Duration | Cost |
|-------|-------|-------|--------|--------|---------:|-----:|
| Product Manager | 1 | {model} | {family} | {effort} | {time} | ${n} |
| Architect | 2b | {model} | {family} | {effort} | {time} | ${n} |
| Arch Critic | 2.5b | {model} | {family} | {effort} | {time} | ${n} |
| QA Sealed (×N) | 2a | {model} | {family} | {effort} | {time} | ${n} |
| Lead Engineer | 3, 5 | {model} | {family} | {effort} | {time} | ${n} |
| QA Validator | 4 | {model} | {family} | {effort} | {time} | ${n} |
| Red Team | 4.5 | {model} | {family} | {effort} | {time} | ${n} |

## Diff Summary

    {files_changed} files changed, {insertions} insertions(+), {deletions} deletions(-)

## Decision

- **approve** → merge the worktree branch into the current branch
- **reject** → discard the worktree; nothing in the working tree is touched

Delivery requires human approval in every autonomy mode, including `dark`.
```

---

## Worked Example

```markdown
# 🏭 Dark Factory — Delivery Report

## Build Summary

| Field | Value |
|-------|-------|
| Run ID | run-20260728-1030 |
| Goal | CSV import CLI with validation |
| Mode | full |
| Autonomy | dark |
| Duration | 00:11:47 |
| Phases completed | 10/10 |
| Total cost | $2.41 |

## Quality Assessment

### Sealed-Envelope Results

| Metric | Value |
|--------|-------|
| **Shadow Score** | **0.0%** (perfect) |
| Independence | strong |
| Seal authors | gpt-5.6-terra (openai), gemini-3.1-pro-preview (google) |
| Implementer | claude-opus-4.8 (anthropic) |
| Sealed tests | 18/18 |
| Open tests | 12/12 |
| Spec ambiguity | 0.06 |
| Initial Shadow Score | 22.2% |
| Hardening cycles | 2 of 4 |
| Hardening velocity | 11.1 points per cycle |
| Seal integrity | intact |

### Gates

| Gate | Value | Threshold | Status |
|------|------:|----------:|--------|
| Spec ambiguity | 0.06 | 0.25 | ✅ |
| Arch critique | medium | high | ✅ |
| Shadow Score | 0.0% | 10% | ✅ |
| Red team (high) | 0 | 0 | ✅ |
| Cost | $2.41 | $5.00 | ✅ |

### Red Team

| Severity | Count |
|----------|------:|
| high | 0 |
| medium | 1 |
| low | 2 |

The single medium finding (traceback disclosure on malformed input) was classified as an
implementation bug and fixed in hardening cycle 2.

## Artifacts Produced

| File | Type | Lines |
|------|------|-------|
| PRD.md | doc | 142 |
| ARCH.md | doc | 108 |
| ARCH-CRITIQUE.md | doc | 46 |
| src/importer.py | code | 187 |
| tests/test_importer.py | test | 96 |

## Diff Summary

    5 files changed, 579 insertions(+), 0 deletions(-)
```

A run that started at 22.2% and finished at 0% is the system working as designed: two
independent model families found six defects the engineer's own tests never looked for, and
the engineer closed them without ever seeing the tests that found them.
