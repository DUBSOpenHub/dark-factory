# 🧪 Testing Guide

Since Dark Factory is a conversational AI skill (not traditional code), testing is done through **conversation playbooks** — scripted interactions that verify expected behavior.

---

## How to Test

1. Register the skill: `/skills add ./`
2. Run each playbook below and verify expected behavior
3. Check the QA checklist before submitting changes

---

## What "good" output looks like

A healthy run includes:

- A factory banner with **run ID** and **mode**
- Checkpoints with the correct `ask_user` options
- A sealed hash displayed after Phase 2 (Full mode)
- A delivery report at the end

Example snippets:

```text
🏭 Factory floor is hot. Run run-20260223-2130 initialized.
🏭 Mode: FULL
```

```text
🏭 Phase 2 complete — Architecture drafted, tests sealed. 🔒 Hash: sha256:...
```

```text
🏭 Phase 0 complete — Invariants OK. implementer=anthropic  seals=openai,google  independence=strong
```

```text
🏭 Phase 4 complete — Sealed envelope opened. Shadow Score: 0%
```

---

## Playbooks

### Playbook 1: Full Pipeline — Basic Build

| Step | You Say | Expected |
|------|---------|----------|
| 1 | `dark factory "build a fizzbuzz CLI tool"` | Factory banner, mode=FULL, run ID, agent lineup |
| 2 | *(Phase 0 runs)* | Invariant check table; families printed; abort on violation |
| 3 | *(Phase 1 runs)* | PRD.md created, Checkpoint 1 presented |
| 4 | Approve | Phase 2 — architect + N sealed QA authors in parallel |
| 5 | *(Phase 2 completes)* | ARCH.md created, sealed hash displayed |
| 6 | *(Phase 2.5 runs)* | AMBIGUITY.md + ARCH-CRITIQUE.md, dual gate, Checkpoint 2 |
| 7 | Approve | Phase 3 — engineer implements code + open tests |
| 8 | *(Phase 3 completes)* | Code files created, Checkpoint 3 |
| 9 | Approve | Phase 4 — **disposable verify worktree**, both suites run |
| 10 | *(Phase 4 completes)* | SHADOW-REPORT.md + .json, Shadow Score |
| 11 | *(Phase 4.5 runs)* | RED-TEAM.md, Breach Score, Checkpoint 4 |
| 12 | Approve | Phase 5 if Shadow Score > 0%, then Phase 6 delivery report |
| 13 | Approve/Reject | Merge or discard worktree |

### Playbook 1b: Invariant Violation Aborts

| Step | You Say | Expected |
|------|---------|----------|
| 1 | Set `roles.qa_sealed` and `roles.lead_eng` to models in the same family | — |
| 2 | `dark factory "anything"` | ⛔ Phase 0 aborts with `cross_family_required` violation |
| 3 | Verify | No worktree created, no agents dispatched, remediation printed |
| 4 | Set `invariants.on_violation: warn`, re-run | Runs, but report is stamped ⚠️ ADVISORY |

### Playbook 1c: Seal Plurality

| Step | You Say | Expected |
|------|---------|----------|
| 1 | Set two `seal_plurality.authors` from distinct families | — |
| 2 | Run a full build | Two sealed suites written independently in Phase 2a |
| 3 | Phase 2.5a | AMBIGUITY.md lists contradictions **without** revealing test code |
| 4 | Verify | Merged envelope hash covers both suites; report lists both families |

### Playbook 1d: Tournament Mode

| Step | You Say | Expected |
|------|---------|----------|
| 1 | `dark factory tournament "build a CSV import CLI"` | Mode=TOURNAMENT, competitors listed |
| 2 | Phase 3 | N competitors build in parallel on separate branches |
| 3 | Phase 4 | All graded against the **same** envelope |
| 4 | Verify | TOURNAMENT.md leaderboard + failure-overlap table |
| 5 | Verify | No competitor shares a family with any seal author |
| 6 | Verify | Only the winner proceeds to hardening and delivery |

### Playbook 2: Express Mode

| Step | You Say | Expected |
|------|---------|----------|
| 1 | `dark factory express "add retry logic to fetch()"` | Mode=EXPRESS, skip PRD/arch |
| 2 | *(build + validate)* | Sealed tests generated from raw goal (hidden) |
| 3 | *(delivery)* | ONE checkpoint only — approve or reject |

### Playbook 3: Sealed-Envelope Integrity

| Step | You Say | Expected |
|------|---------|----------|
| 1 | Start a full factory run | Phases proceed normally |
| 2 | At Checkpoint 2 | SHA-256 hash shown for sealed tests |
| 3 | During Phase 3 | Vault lives at `~/.factory-vault/`, **outside** the build worktree |
| 4 | At Phase 4 | Sealed tests run in a **disposable verify worktree** built from the engineer's commit |
| 5 | Verify | Verify worktree is removed after validation; build worktree never contained sealed tests |
| 6 | Verify | Canary file untouched — `seal_broken: false` in SHADOW-REPORT.json |
| 7 | If gaps exist | Hardening shows failure messages only (no test code) |

### Playbook 4: Resume After Crash

| Step | You Say | Expected |
|------|---------|----------|
| 1 | Start a factory run, approve through Phase 2 | state.json written |
| 2 | *(simulate crash — close session)* | State persisted |
| 3 | `dark factory resume` | Reads state.json, shows progress, resumes at Phase 3 |

### Playbook 5: Abort and Cleanup

| Step | You Say | Expected |
|------|---------|----------|
| 1 | Start a factory run | Worktree created |
| 2 | At any checkpoint, select "Abort" | Worktree removed, branch deleted |
| 3 | Verify | No `.factory/runs/` worktrees remain |

### Playbook 6: Skip-All (Go Dark)

| Step | You Say | Expected |
|------|---------|----------|
| 1 | Start factory run, approve Phase 1 | Checkpoint presented |
| 2 | Select "Skip remaining" | Autonomy switches to `dark`; phases run without pausing |
| 3 | Force a gate breach (e.g. `gates.shadow_score_max: 0`) | ⛔ Run still stops, prints measured value + threshold + evidence |
| 4 | Phase 6 delivery | STILL shows checkpoint (can't skip delivery in any mode) |

### Playbook 7: Modify Phase

| Step | You Say | Expected |
|------|---------|----------|
| 1 | Complete Phase 1 | PRD checkpoint shown |
| 2 | Select "Modify" → "add rate limiting" | Phase 1 re-runs with feedback |
| 3 | *(re-run completes)* | Updated PRD.md, checkpoint shown again |

### Playbook 8: Hardening Loop

| Step | You Say | Expected |
|------|---------|----------|
| 1 | Complete Phase 4 with Shadow Score > 0% | Hardening begins |
| 2 | *(cycle 1)* | Same agent continues via `write_agent` — context preserved, no re-briefing |
| 3 | *(cycle 2)* | Effort escalates per `hardening.ladder` |
| 4 | *(cycle 3)* | Model switches family per the ladder; still never the seal author's family |
| 5 | *(final rung)* | `reveal: assertions` — failing assertions shown, suite source still withheld |
| 6 | *(after max cycles)* | Escalation: continue-hardening / deliver-as-is / abort |
| 7 | Verify | `hardening_velocity` reported; `initial_shadow_score` recorded before cycle 1 |

---

## QA Checklist

Before submitting changes, verify:

**Independence (Level 4)**

- [ ] 🧬 Phase 0 prints the invariant table and the resolved family of every role
- [ ] 🧬 Seal author and implementer are in **different** families
- [ ] 🧬 A same-family config aborts the run (or warns, per `invariants.on_violation`)
- [ ] 🧬 Every dispatch omits `reasoning_effort` / `context_tier` for models that lack them
- [ ] 🧬 `independence` and `seal_author_families` appear in SHADOW-REPORT.json

**Sealed envelope**

- [ ] 🔒 Sealed tests generated from PRD only (never from code/arch)
- [ ] 🔒 SHA-256 hash of the sealed envelope displayed at Phase 2
- [ ] 🔒 Vault is at `~/.factory-vault/`, outside the build worktree
- [ ] 🔒 Validation runs in a disposable verify worktree, removed afterwards
- [ ] 🔒 Canary untouched → `seal_broken: false`
- [ ] 🔒 Hardening sends failure messages only (test source never revealed)

**Pipeline**

- [ ] 🏭 Factory banner displays on start (run ID, mode, agent lineup)
- [ ] 📋 PRD.md produced with user stories and acceptance criteria
- [ ] 🏗️ ARCH.md produced with components, file structure, tech choices
- [ ] 🧐 ARCH-CRITIQUE.md produced before any code is written
- [ ] ❓ AMBIGUITY.md produced and reveals no test source
- [ ] ✅ Both suites run in Phase 4
- [ ] 📊 SHADOW-REPORT.md **and** SHADOW-REPORT.json produced
- [ ] 🗡️ RED-TEAM.md produced with findings classified spec-gap vs implementation-bug
- [ ] 🔧 Hardening caps at configured max cycles, then escalates
- [ ] 📈 `initial_shadow_score` recorded before cycle 1; `hardening_velocity` reported

**Control**

- [ ] 🚦 Gates print measured value, threshold, and evidence on breach
- [ ] 📋 Checkpoints use `ask_user` with exactly 4 choices
- [ ] ⏭️ Skip-all still enforces gates and still shows final delivery checkpoint
- [ ] 💾 state.json written on every phase transition, including gate results
- [ ] 🔄 Resume works from state.json
- [ ] 🛑 Abort cleans up worktrees, branches, and the vault
- [ ] ⚡ Express mode skips PRD/arch, one checkpoint at delivery — but never skips gates
- [ ] 🗄️ SQL tables track runs, phases, gates, costs, and learning memory

---

## Validation commands

```bash
# Level 4 conformance — families, capabilities, plurality, gates
python3 .github/scripts/validate_conformance.py

# YAML syntax (Ruby has YAML built-in)
ruby -e 'require "yaml"; YAML.load_file("catalog.yml"); YAML.load_file("config.yml")'

# Catalog references exist
ruby -e 'require "yaml"; c=YAML.load_file("catalog.yml"); refs=[c.dig("links","skill_file")]+(c.dig("links","agents")||[]); refs.compact.each{|p| abort("missing: #{p}") unless File.file?(p)}; puts "ok"'

# Count agent lines (should be <= 200)
wc -l agents/*.md

# Verify SKILL.md has frontmatter
head -1 SKILL.md | grep -q '^---' && echo '✅ Frontmatter present'

# No model IDs hardcoded outside config.yml
! grep -rn --include='*.md' -E '\b(claude-opus|gpt-5|gemini-3|kimi-k2)[a-z0-9.\-]*' agents/ SKILL.md \
  | grep -v 'example\|Example\|worked' && echo '✅ No hardcoded models'
```
