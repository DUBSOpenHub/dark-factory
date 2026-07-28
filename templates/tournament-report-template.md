# Tournament Report Template

> Produced in tournament mode after all competitors are scored against the **same** sealed
> envelope. Written to `TOURNAMENT.md`.
>
> Normal mode asks "is this implementation good enough". Tournament mode asks "which of these
> implementations is best" — and answers it with evidence instead of preference.

---

## The Rules

1. Every competitor receives the **identical** PRD and ARCH.
2. Every competitor is graded by the **identical** sealed envelope.
3. No competitor may share a family with any seal author.
4. Competitors never see each other's work.
5. The envelope is written **before** any competitor starts.

Break rule 2 and you are comparing graders. Break rule 3 and you are comparing family
affinities. Break rule 5 and the tests can be shaped to a winner.

## Ranking

`config.tournament.selection` (default `shadow_score`), tie-broken in order:

| Rank key | Direction | Rationale |
|----------|-----------|-----------|
| `shadow_score` | lower wins | Correctness against the spec is the point |
| `open_tests_passed` | higher wins | Did it also honour its own contract |
| `cost_usd` | lower wins | Equal correctness for less is strictly better |
| `duration_sec` | lower wins | Final tiebreak |

`pareto` selection instead reports the non-dominated set on (shadow_score, cost) and does not
pick a single winner. Use it when the cheapest acceptable answer matters more than the best
answer.

---

```markdown
# Tournament Report

**Run:** {run_id}
**Goal:** {goal}
**Sealed envelope:** sha256:{hash} — {N} tests, authored by {models}
**Competitors:** {N}
**Selection:** {shadow_score | pareto}

## Leaderboard

| Rank | Competitor | Family | Shadow Score | Sealed P/F | Open P/F | Cost | Duration |
|------|-----------|--------|-------------:|-----------:|---------:|-----:|---------:|
| 🥇 1 | {model} | {family} | {x}% | {p}/{f} | {p}/{f} | ${n} | {n}s |
| 🥈 2 | {model} | {family} | {x}% | {p}/{f} | {p}/{f} | ${n} | {n}s |
| 🥉 3 | {model} | {family} | {x}% | {p}/{f} | {p}/{f} | ${n} | {n}s |

**Winner:** {model} — {one sentence on why it won}

## Failure Overlap

Which sealed tests each competitor failed. This is the most informative table in the report.

| Sealed test | Category | {c1} | {c2} | {c3} |
|-------------|----------|:----:|:----:|:----:|
| {test_name} | security | ❌ | ❌ | ❌ |
| {test_name} | edge_case | ❌ | ✅ | ✅ |

### Reading the overlap

| Pattern | Meaning | Action |
|---------|---------|--------|
| **All competitors fail the same test** | Not a model weakness — the **specification** is unclear or the requirement is genuinely hard. No amount of model swapping fixes it. | Route to the Product Manager. Record in blind-spot memory. |
| **One competitor fails alone** | A genuine capability difference on that dimension. | Evidence for role assignment in `config.roles`. |
| **All pass** | The test does not discriminate — but it still proves the requirement is met. | Keep it. Non-discriminating is not worthless. |

A tournament where every competitor fails the same three security tests has not found a bad
model. It has found a bad PRD.

## Cost / Quality

| Competitor | Shadow Score | Cost | Pareto |
|-----------|-------------:|-----:|--------|
| {model} | {x}% | ${n} | ✅ non-dominated |
| {model} | {x}% | ${n} | dominated by {model} |

A competitor is **dominated** if another scored at least as well for less money. The
non-dominated set is the only honest answer to "which should I use" — everything else depends
on how much a point of Shadow Score is worth to you.

## Delivery

Only the winning branch proceeds to Phase 5 hardening and Phase 6 delivery. Losing branches
are retained for inspection until the run is archived, then deleted.
```

---

## Example

```markdown
# Tournament Report

**Run:** run-20260728-1400
**Goal:** CSV import CLI with validation
**Sealed envelope:** sha256:9f3c1a — 18 tests, authored by gpt-5.6-terra, gemini-3.1-pro-preview
**Competitors:** 3
**Selection:** shadow_score

## Leaderboard

| Rank | Competitor | Family | Shadow Score | Sealed P/F | Open P/F | Cost | Duration |
|------|-----------|--------|-------------:|-----------:|---------:|-----:|---------:|
| 🥇 1 | claude-opus-4.8 | anthropic | 5.6% | 17/1 | 12/0 | $1.90 | 512s |
| 🥈 2 | kimi-k2.7-code | moonshot | 11.1% | 16/2 | 11/1 | $0.60 | 388s |
| 🥉 3 | mai-code-1-flash-picker | microsoft | 22.2% | 14/4 | 10/2 | $0.20 | 240s |

**Winner:** claude-opus-4.8 — only competitor to handle both the malformed-header and the
duplicate-row cases.

## Failure Overlap

| Sealed test | Category | opus-4.8 | k2.7 | flash |
|-------------|----------|:--------:|:----:|:-----:|
| test_rejects_path_traversal | security | ❌ | ❌ | ❌ |
| test_duplicate_row_merges | edge_case | ✅ | ❌ | ❌ |
| test_malformed_header | error_handling | ✅ | ✅ | ❌ |

`test_rejects_path_traversal` failed for all three. Three independent families, three
independent failures, one shared cause: the PRD never asked for path validation. This is a
specification defect, and swapping in a fourth model would not have found it either.

## Cost / Quality

| Competitor | Shadow Score | Cost | Pareto |
|-----------|-------------:|-----:|--------|
| claude-opus-4.8 | 5.6% | $1.90 | ✅ non-dominated |
| kimi-k2.7-code | 11.1% | $0.60 | ✅ non-dominated |
| mai-code-1-flash-picker | 22.2% | $0.20 | ✅ non-dominated |

No competitor dominates another — each buys a real quality increase for a real cost increase.
`kimi-k2.7-code` reached 89% correctness for 32% of the winner's price.
```
