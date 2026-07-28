# Ambiguity Report Template

> Produced by the orchestrator in Phase 2.5a by comparing the N sealed suites **without
> revealing their contents**. Written to `AMBIGUITY.md`.
>
> This report is the reason seal plurality exists. One sealed suite tells you whether the
> code is right. Two independent sealed suites tell you whether the **spec** is right.

---

## The Measurement

Two model families read the same PRD and wrote tests independently. Where their assertions
**contradict**, at least one of them inferred something the specification did not state.

```text
spec_ambiguity = contradicting_acceptance_criteria / total_acceptance_criteria
```

This is not a measure of test quality. It is a measure of **specification quality**.

| Value | Reading |
|-------|---------|
| 0.00 | Both families read the spec identically. The spec is unambiguous. |
| ≤ 0.25 | Normal drift on under-specified edges. Proceed. |
| > 0.25 | The spec supports materially different systems. **Gate breach.** |

## Contradiction vs Divergence

| | Definition | Counts toward ambiguity? |
|---|---|---|
| **Contradiction** | Both suites assert on the same behaviour, incompatibly | ✅ Yes |
| **Divergence** | One suite tests something the other did not | ❌ No |

Divergence is the normal, healthy result of two minds with different instincts — it is
exactly why plurality raises coverage. Only a genuine contradiction proves the spec is
ambiguous, because both authors read the same words and reached opposite conclusions.

---

```markdown
# Ambiguity Report

**Specification:** PRD.md
**Sealed suites:** {N}
**Authors:** {model} ({family}), {model} ({family})
**Acceptance criteria:** {total}
**Contradictions:** {n}
**Spec Ambiguity:** {n/total} — {PASS | ⛔ BREACH} (threshold {threshold})

## Contradictions

### {AC-N}: {requirement text, quoted from the PRD}

| Suite | Expects |
|-------|---------|
| {family_a} | {behaviour} |
| {family_b} | {behaviour} |

**Why they differ:** {the specific word or omission in the PRD that permits both readings}

**Resolution required:** {the sentence the PRD needs}

## Divergences (informational — not counted)

| AC | Only in | Behaviour tested |
|----|---------|------------------|
| AC-5 | google | Unicode normalisation of names |
| AC-8 | openai | Concurrent import of the same file |

Divergences show what each family thought to check. They are the coverage dividend of
plurality and require no action.

## Disclosure Boundary

This report names **behaviours in dispute**. It must never contain:

- Test source code
- Test function names
- Assertion values or fixtures
- The number of tests per acceptance criterion

The Lead Engineer reads this report. If it leaks the suite, the envelope is broken and the
Shadow Score becomes meaningless — the exact failure this whole protocol exists to prevent.
```

---

## Example — Breach

```markdown
# Ambiguity Report

**Specification:** PRD.md
**Sealed suites:** 2
**Authors:** gpt-5.6-terra (openai), gemini-3.1-pro-preview (google)
**Acceptance criteria:** 9
**Contradictions:** 3
**Spec Ambiguity:** 0.33 — ⛔ BREACH (threshold 0.25)

## Contradictions

### AC-4: "Importing a record that already exists should be handled gracefully."

| Suite | Expects |
|-------|---------|
| openai | HTTP 409, no mutation |
| google | HTTP 200, fields merged into the existing record |

**Why they differ:** "handled gracefully" specifies a tone, not a behaviour. Reject and
merge are both graceful.

**Resolution required:** State the outcome. E.g. "Importing an existing record MUST merge
non-empty incoming fields and return 200."

### AC-7: "Timestamps are recorded on every mutation."

| Suite | Expects |
|-------|---------|
| openai | Stored as UTC, `Z`-suffixed |
| google | Stored in the server's local timezone with offset |

**Why they differ:** The PRD never names a timezone.

**Resolution required:** "Timestamps MUST be stored as UTC in RFC 3339 format."

### AC-9: "The list endpoint returns matching records."

| Suite | Expects |
|-------|---------|
| openai | Paginated, default page size 50 |
| google | All matches in a single response |

**Why they differ:** "returns matching records" is silent on volume.

**Resolution required:** Specify pagination or explicitly state that the full set is returned.
```

Three contradictions on nine criteria means one third of this specification supports two
different systems. Building it now guarantees a rework cycle no test can prevent — the code
would be correct against one reading and wrong against the other, and nobody would know which.
