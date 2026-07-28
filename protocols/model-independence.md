# Model Independence Protocol

> The invariant that separates Shadow Score **Level 4** from Level 3.

## The Problem

Dark Factory v0.1.0 shipped this configuration:

```yaml
qa_sealed: claude-sonnet-4.6
lead_eng:  claude-sonnet-4.6   # same model, same family, same priors
```

Both agents had perfect information isolation. Separate `task()` invocations, no shared
context, sealed tests stored outside the build worktree, hardening limited to failure
messages. By the letter of Shadow Score Spec v1.0.0, that configuration is **fully Level 3
conformant**.

It is also **structurally incapable of producing a trustworthy score**.

## Why Information Isolation Is Not Enough

The sealed envelope exists to answer one question:

> Did the builder implement what the specification required, as judged by someone who did not
> write the implementation?

"Someone who did not write the implementation" was operationalised in v1.0.0 as *an agent that
cannot see the implementation*. That was a complete theory of independence when there was
effectively one frontier model to choose from.

It is no longer complete, because two instances of the same model family share:

- **Training data** — the same corpus, so the same idioms look "obviously correct"
- **Reasoning priors** — the same decomposition instincts on an ambiguous requirement
- **Failure modes** — and this is the one that matters

Consider a PRD requiring username uniqueness.

| | Same family | Different families |
|---|---|---|
| Seal Author | Doesn't consider Unicode normalization | Tests `"admin"` vs `"аdmin"` (Cyrillic а) |
| Implementer | Doesn't handle Unicode normalization | Doesn't handle it either |
| Sealed test | **Never fires** | **Fires — homograph collision** |
| Shadow Score | **0% — ships green** | 6.7% — one hardening cycle fixes it |
| Reality | Homograph impersonation vulnerability | Fixed before delivery |

The same-family run does not merely *fail to catch* the bug. It reports a **perfect score**,
which is worse than reporting nothing — it manufactures unwarranted confidence.

The bias has a direction and it is the dangerous one: correlated blind spots push the Shadow
Score **toward 0%**. Every same-family score is optimistic by an unknown margin.

## The Invariant

```yaml
invariants:
  cross_family_required: true
```

> **The Seal Author's model family MUST differ from the Implementer's model family.**

Enforced at Phase 0. On violation, the orchestrator **refuses to run** (`on_violation: abort`)
or proceeds with the score explicitly marked **ADVISORY** (`advisory`). It never silently
produces a score it knows is biased.

## Bias Direction by Role Pair

Not every shared family is equally harmful. What matters is which way the error pushes the
score.

| Pair | Effect | Verdict |
|------|--------|---------|
| Seal Author == Implementer | Correlated blind spots → score **too low** → overclaims quality | 🔴 **Forbidden** |
| Product Manager == Implementer | Builder infers unstated PM assumptions → score **too low** | 🔴 **Forbidden** |
| Product Manager == Seal Author | Sealer infers unstated PM assumptions → score **too high** | 🟡 Allowed, disclosed |
| Arch Critic == Architect | Critic shares the architect's blind spots → approves them | 🔴 **Forbidden** |
| Red Team == Implementer | Misses the same attack surfaces the builder missed | 🔴 **Forbidden** |
| Tournament competitor == Seal Author | That competitor scores artificially well → biases model selection | 🔴 **Forbidden** |
| Hardening rung == Seal Author | Engineer shares priors with the tests judging it | 🔴 **Forbidden** |

The rule is not "everything must differ." It is: **never allow a correlation that pushes the
score downward.** Upward bias is conservative — it penalises the builder slightly and is
disclosed in the report. Downward bias silently ships defects.

`.github/scripts/validate_conformance.py` checks every pair on each PR.

## Seal Plurality

```yaml
invariants:
  seal_plurality_min: 2
```

One sealed suite from one model is a single point of failure: the Shadow Score is only ever as
good as the tests behind it. With N independent suites from N families:

- **Union** them for a strictly stronger envelope
- **Diff** them to measure `spec_ambiguity`

Suites that contradict each other are the highest-value output of the entire pipeline. Two
frontier models from different labs read the same specification and disagreed about correct
behavior — that is proof the **specification** is defective, delivered before a line of code
exists.

This was not buildable in early 2026. It requires multiple strong, cheap, genuinely different
model families to exist simultaneously, which is a 2026 development, not a 2025 one.

## Choosing Families

The orchestrator resolves models to families via `config.families`. Selection guidance:

1. **Seal authors: highest reasoning effort available.** Adversarial edge-case generation is
   exactly what deep reasoning buys, and it is a one-time cost amortised across every hardening
   cycle in the run.
2. **Implementer: strongest coding model in a family that is not sealing.**
3. **Validator: cheapest capable model.** It runs a test runner and parses output. Do not pay
   it to think.
4. **Check `config.model_capabilities` before dispatch.** Not every model accepts
   `reasoning_effort` or `long_context`; passing an unsupported parameter is a silent failure
   mode.

## Reporting

Every Shadow Score report carries provenance:

```json
{
  "report": {
    "independence": "strong",
    "seal_author_models": ["gpt-5.6-terra", "gemini-3.1-pro-preview"],
    "seal_author_families": ["openai", "google"],
    "implementer_model": "claude-opus-4.8",
    "implementer_family": "anthropic"
  }
}
```

These live under `report.*`, per Shadow Score Spec §5.2. Depth matters: a provenance field
written at the document root is not present as far as a validator is concerned, so the Level 4
check silently never runs and the report claims a conformance level nobody verified.

Without these fields a Shadow Score is a bare number with no provenance, and you cannot
distinguish *"genuinely clean"* from *"the same model graded its own homework through a
keyhole."* Those are wildly different claims. A score that does not disclose its independence
should not be trusted.
