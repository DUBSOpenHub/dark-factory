# Checkpoint Gate Protocol

## Purpose

Checkpoints pause the autonomous pipeline for human review and approval at phase boundaries. They provide observability without requiring constant supervision.

## Checkpoint Format

Each checkpoint presents via `ask_user`:

```
╔══════════════════════════════════════════════════════════╗
║  📋 CHECKPOINT {N} — {Phase Name} Complete               ║
╠══════════════════════════════════════════════════════════╣
║  Artifacts: {list of files produced}                     ║
║  Key metrics: {phase-specific summary stats}             ║
║  Confidence: {🟢 High | 🟡 Medium | 🔴 Low}              ║
║  Duration: {phase_time}                                  ║
╚══════════════════════════════════════════════════════════╝
```

## User Choices

Every checkpoint offers exactly 4 options:

1. **✅ Approve** — proceed to next phase
2. **📝 Modify** — provide feedback, re-run this phase with adjustments
3. **⏭️ Skip remaining** — go fully dark (no more checkpoints until delivery)
4. **🛑 Abort** — clean up worktree, discard everything

## Checkpoint Locations

### Full Mode (6 phases)
| Checkpoint | After Phase | What User Reviews |
|------------|-------------|-------------------|
| 1 | Phase 1 (PRD) | Product spec, user stories, scope |
| 2 | Phase 2 (Arch + Seal) | Architecture design (sealed tests hidden) |
| 3 | Phase 3 (Build) | Implementation code, open test suite |
| 4 | Phase 4 (Validate) | Gap analysis report, sealed test results |
| 5 | Phase 6 (Delivery) | Final report, merge decision |

### Express Mode (3 phases)
| Checkpoint | After Phase | What User Reviews |
|------------|-------------|-------------------|
| 1 | Phase 6 (Delivery) | Code, test results, merge decision |

> **Note:** Phase 5 (Hardening) still runs when gap score > 0%, even in express mode. Express is "faster" not "less safe" — it skips specification phases, not quality gates.

## State Persistence

After each checkpoint decision, write to `state.json`:
```json
{
  "checkpoints": {
    "1": {"status": "approved", "feedback": null, "decided_at": "..."},
    "2": {"status": "modified", "feedback": "simplify the data model", "decided_at": "..."}
  }
}
```

## Skip-All Behavior

When user selects "Skip remaining":
- Set `skip_all: true` in state.json
- All subsequent phases run without pausing
- Final delivery checkpoint is STILL presented (cannot be skipped)
- User must explicitly approve or reject the merge
