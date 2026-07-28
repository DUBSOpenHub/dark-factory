# Architecture Critique Template

> Produced by the Arch Critic (`rubber-duck`) in Phase 2.5b, before any code is written.
> Written to `ARCH-CRITIQUE.md`.
>
> A design flaw caught here costs one agent turn. The same flaw caught in Phase 4 costs a
> full hardening cycle. Caught after delivery, it costs a rewrite.

---

```markdown
# Architecture Critique

**Reviewing:** ARCH.md
**Against:** PRD.md
**Reviewer:** {model} ({family})
**Highest severity:** {critical | high | medium | low | none}

## Verdict

{One paragraph. Is this architecture fit to build against? If not, what single change
would make it fit?}

## Requirement Coverage

Every acceptance criterion in the PRD, mapped to the component that satisfies it.

| AC | Requirement | Covered by | Status |
|----|-------------|-----------|--------|
| AC-1 | {requirement} | {component} | ✅ covered |
| AC-2 | {requirement} | — | ❌ **unaddressed** |
| AC-3 | {requirement} | {component} | ⚠️ partial — {what is missing} |

Unaddressed acceptance criteria are automatically at least **high** severity. The
architecture is the contract; a requirement with no home in it will not be built.

## Findings

### [{SEVERITY}] {Title}

- **Where:** {section or component in ARCH.md}
- **Problem:** {what is wrong — be specific}
- **Consequence:** {what breaks at runtime, and when}
- **Fix:** {the concrete change to make}

## Severity Definitions

| Severity | Meaning |
|----------|---------|
| `critical` | The architecture cannot satisfy the PRD. Building it produces a wrong system. |
| `high` | A requirement is unaddressed, or a design choice guarantees a defect class. |
| `medium` | A real weakness with a workaround; will cost rework later. |
| `low` | Improvement worth making; does not threaten correctness. |
| `none` | No findings. |

## Not Findings

Deliberately excluded so the signal stays high:

- Naming, formatting, file layout preferences
- Alternative-but-equivalent designs ("I would have used X")
- Speculative future requirements not in the PRD
- Anything the PRD explicitly rules out of scope

## Gate

`config.gates.arch_critic_severity` (default `high`). Any finding at or above that severity
**breaches the gate** and stops the run before implementation begins.
```

---

## Example

```markdown
# Architecture Critique

**Reviewing:** ARCH.md
**Against:** PRD.md
**Reviewer:** gpt-5.6-terra (openai)
**Highest severity:** high

## Verdict

The component decomposition is sound and the data model is clean, but the design has no
answer for concurrent writes — and AC-7 requires exactly that. Add an explicit
concurrency strategy before building.

## Requirement Coverage

| AC | Requirement | Covered by | Status |
|----|-------------|-----------|--------|
| AC-1 | Import CSV | `Importer` | ✅ covered |
| AC-7 | Two users may edit the same record | — | ❌ **unaddressed** |
| AC-9 | Audit every mutation | `Store` | ⚠️ partial — no actor recorded |

## Findings

### [HIGH] No concurrency strategy for record mutation

- **Where:** §4 Data Layer
- **Problem:** `Store.update()` is specified as read-modify-write with no versioning,
  locking, or conflict detection. AC-7 explicitly permits two simultaneous editors.
- **Consequence:** Last write wins silently. The second user's edit vanishes with no error.
- **Fix:** Add an optimistic-concurrency `version` column; `update()` takes the expected
  version and returns a conflict error on mismatch.

### [MEDIUM] Audit log records the change but not the actor

- **Where:** §4.2 Audit
- **Problem:** The audit record has `before`, `after`, `timestamp` — no `actor`.
- **Consequence:** AC-9's audit trail cannot answer "who changed this", which is the
  question audit trails exist to answer.
- **Fix:** Thread the authenticated principal into `Store` and persist it.
```
