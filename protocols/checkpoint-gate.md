# Gate Protocol

## Purpose

"Lights Out" means **autonomous with evidence**, not autonomous with permission.

v0.1.0 blocked on a human at five phase boundaries by default. That is a supervised assembly
line with the foreman watching, not a dark factory. This protocol replaces unconditional
approval prompts with **automated quality gates that escalate only on threshold breach** —
while keeping human checkpoints available for operators who want them.

## Autonomy Modes

Set by `config.autonomy.mode`, overridable per run (`dark factory dark — <goal>`).

| Mode | Behaviour |
|------|-----------|
| `dark` | Run end to end. Stop **only** on gate breach or Phase 6 delivery. |
| `supervised` | Human checkpoint at each phase boundary (v0.1.0 behaviour). **Default.** |
| `manual` | Checkpoint at every phase **and** every hardening cycle. |

**Phase 6 delivery always requires human approval, in every mode.** This is not configurable.

## Quality Gates

Evaluated automatically after the relevant phase in every mode.

| Gate | Phase | Config key | Breach condition |
|------|-------|-----------|------------------|
| Spec ambiguity | 2.5a | `gates.spec_ambiguity_max` | Sealed suites contradict each other above the threshold |
| Architecture critique | 2.5b | `gates.arch_critic_severity` | Any finding at or above this severity |
| Shadow Score | 4 | `gates.shadow_score_max` | Sealed failure percentage exceeds the threshold |
| Red Team | 4.5 | `gates.red_team_high_findings_max` | High-severity findings exceed the count |
| Cost ceiling | any | `gates.cost_ceiling_usd` | Cumulative run cost exceeds the ceiling |
| Seal integrity | 4 | — | Hash mismatch or canary read. **Always aborts.** |

### Gates print evidence, not verdicts

```text
🏭 Gate PASSED — shadow_score 4.0% ≤ 10% | red_team high 0 | cost $1.42 ≤ $5.00
```

```text
🏭 ⛔ Gate BREACHED — spec_ambiguity 0.34 > 0.25
   3 contradictions between sealed suites:
   - AC-4: openai suite expects 409 on duplicate; google suite expects 200 + merge
   - AC-7: openai suite expects UTC normalisation; google suite expects local time
   - AC-9: openai suite requires pagination; google suite asserts full result set
   Two independent model families read the spec differently. The SPEC is ambiguous.
```

A breach that cannot explain itself is not actionable. Always state the measured value, the
threshold, and the specific findings.

### Breach handling

`config.autonomy.on_gate_breach`:

- **`park_and_notify`** (default) — write state, print the breach with evidence, `ask_user`
- **`abort`** — clean up and stop

## Human Checkpoints

In `supervised` and `manual` modes, each phase boundary presents:

```text
╔══════════════════════════════════════════════════════════╗
║  📋 CHECKPOINT {N} — {Phase Name} Complete               ║
╠══════════════════════════════════════════════════════════╣
║  Artifacts: {files produced}                             ║
║  Key metrics: {phase-specific stats}                     ║
║  Gates: {passed / breached with values}                  ║
║  Cost so far: ${N}                                       ║
║  Duration: {phase_time}                                  ║
╚══════════════════════════════════════════════════════════╝
```

### Choices

| Choice | Action |
|--------|--------|
| ✅ **approve** | Proceed to the next phase |
| 📝 **modify** | Re-run this phase with feedback appended to the agent prompt |
| ⏭️ **skip-all** | Switch to `autonomy: dark` for the remainder |
| 🛑 **abort** | Remove worktrees, delete branches, purge the vault, mark aborted |

Phase 6 offers only **approve** / **reject**.

**`skip-all` does not disable gates.** It sets autonomy to `dark`: the run stops narrating at
every boundary but still stops hard on a breach, and delivery is still human-approved. Going
dark means trusting the *gates*, not abandoning them.

## Checkpoint Locations

### Full / Tournament Mode

| Checkpoint | After | What the operator reviews |
|------------|-------|---------------------------|
| 1 | Phase 1 | PRD — user stories, acceptance criteria, scope |
| 2 | Phase 2.5 | Architecture + critique + ambiguity report (sealed tests stay hidden) |
| 3 | Phase 3 | Implementation and open tests (all competitors, in tournament mode) |
| 4 | Phase 4.5 | Shadow Score, coverage comparison, red team findings |
| 5 | Phase 6 | Delivery report and merge decision |

### Express Mode

| Checkpoint | After | What the operator reviews |
|------------|-------|---------------------------|
| 1 | Phase 6 | Code, test results, merge decision |

> Phase 5 hardening still runs whenever Shadow Score > 0%, in every mode. Express is **faster,
> not less safe** — it skips specification phases, never quality gates.

## State Persistence

After every gate evaluation and checkpoint decision, write to `state.json`:

```json
{
  "gates": {
    "spec_ambiguity": {"value": 0.06, "threshold": 0.25, "status": "passed"},
    "arch_critic": {"value": "medium", "threshold": "high", "status": "passed"},
    "shadow_score": {"value": 4.0, "threshold": 10, "status": "passed"},
    "red_team": {"value": 0, "threshold": 0, "status": "passed"},
    "cost": {"value": 1.42, "threshold": 5.00, "status": "passed"}
  },
  "checkpoints": {
    "1": {"status": "approved", "feedback": null, "decided_at": "..."},
    "2": {"status": "modified", "feedback": "simplify the data model", "decided_at": "..."}
  }
}
```

Gate history is what makes a dark run auditable after the fact. A run nobody watched still has
to be reviewable.
