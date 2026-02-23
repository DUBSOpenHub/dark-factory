# 🏭 Dark Factory — Delivery Report

## Build Summary
- **Run ID**: {run_id}
- **Goal**: {goal}
- **Mode**: {full|express}
- **Duration**: {total_time}
- **Phases completed**: {N}/6

## Artifacts Produced

| File | Type | Lines |
|------|------|-------|
| {path} | {code|test|doc|config} | {N} |

## Quality Assessment

### Sealed-Envelope Results
- **Gap Score**: {percentage}% ({interpretation})
- **Sealed tests**: {passed}/{total} passed
- **Open tests**: {passed}/{total} passed
- **Hardening cycles**: {N} (max 3)

### Agent Performance
| Agent | Phase | Duration | Model |
|-------|-------|----------|-------|
| Product Manager | 1 | {time} | {model} |
| Architect | 2b | {time} | {model} |
| QA Sealed | 2a | {time} | {model} |
| Engineer | 3 | {time} | {model} |
| QA Validator | 4 | {time} | {model} |

## Diff Summary
```
{files_changed} files changed, {insertions} insertions(+), {deletions} deletions(-)
```

## Decision
- **approve** → merge worktree to current branch
- **reject** → discard worktree, nothing touched
