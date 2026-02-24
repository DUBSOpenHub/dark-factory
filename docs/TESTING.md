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
🏭 Phase 4 complete — Sealed envelope opened. Gap score: 0%
```

---

## Playbooks

### Playbook 1: Full Pipeline — Basic Build

| Step | You Say | Expected |
|------|---------|----------|
| 1 | `dark factory "build a fizzbuzz CLI tool"` | Factory banner, mode=FULL, run ID, agent lineup |
| 2 | *(Phase 1 runs)* | PRD.md created, Checkpoint 1 presented |
| 3 | Approve | Phase 2 starts — architect + qa-sealed in parallel |
| 4 | *(Phase 2 completes)* | ARCH.md created, sealed hash displayed, Checkpoint 2 |
| 5 | Approve | Phase 3 — engineer implements code + open tests |
| 6 | *(Phase 3 completes)* | Code files created, Checkpoint 3 |
| 7 | Approve | Phase 4 — sealed tests copied, both suites run |
| 8 | *(Phase 4 completes)* | GAP-REPORT.md, gap score, Checkpoint 4 |
| 9 | Approve | Phase 5 if gaps, then Phase 6 delivery report |
| 10 | Approve/Reject | Merge or discard worktree |

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
| 3 | At Phase 4 | Sealed tests run independently |
| 4 | Verify | Engineer never saw sealed test code in Phases 1-3 |
| 5 | If gaps exist | Hardening shows failure messages only (no test code) |

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
| 2 | Select "Skip remaining" | Phases 2-5 run without pausing |
| 3 | Phase 6 delivery | STILL shows checkpoint (can't skip delivery) |

### Playbook 7: Modify Phase

| Step | You Say | Expected |
|------|---------|----------|
| 1 | Complete Phase 1 | PRD checkpoint shown |
| 2 | Select "Modify" → "add rate limiting" | Phase 1 re-runs with feedback |
| 3 | *(re-run completes)* | Updated PRD.md, checkpoint shown again |

### Playbook 8: Hardening Loop

| Step | You Say | Expected |
|------|---------|----------|
| 1 | Complete Phase 4 with gap score > 0% | Hardening begins |
| 2 | *(cycle 1)* | Engineer gets failure messages, fixes code |
| 3 | *(re-validate)* | If still failing, cycle 2 |
| 4 | *(after max cycles)* | Escalation: continue-hardening / deliver-as-is / abort |

---

## QA Checklist

Before submitting changes, verify:

- [ ] 🏭 Factory banner displays on start (run ID, mode, agent lineup)
- [ ] 📋 PRD.md produced with user stories and acceptance criteria
- [ ] 🏗️ ARCH.md produced with components, file structure, tech choices
- [ ] 🔒 Sealed tests generated from PRD only (never from code/arch)
- [ ] 🔒 SHA-256 hash of sealed directory displayed at Phase 2
- [ ] 👩‍💻 Engineer never accesses `.factory/sealed/` during build
- [ ] ✅ Both test suites run in Phase 4
- [ ] 📊 GAP-REPORT.md produced with gap score
- [ ] 🔧 Hardening sends failure messages only (no test code)
- [ ] 🔧 Hardening caps at configured max cycles, then escalates
- [ ] 📋 Checkpoints use `ask_user` with exactly 4 choices
- [ ] ⏭️ Skip-all still shows final delivery checkpoint
- [ ] 💾 state.json written on every phase transition
- [ ] 🔄 Resume works from state.json
- [ ] 🛑 Abort cleans up worktree and branch
- [ ] ⚡ Express mode skips PRD/arch, one checkpoint at delivery
- [ ] 🗄️ SQL tables track runs and phase results

---

## Validation commands

```bash
# YAML syntax (Ruby has YAML built-in)
ruby -e 'require "yaml"; YAML.load_file("catalog.yml"); YAML.load_file("config.yml")'

# Catalog references exist
ruby -e 'require "yaml"; c=YAML.load_file("catalog.yml"); refs=[c.dig("links","skill_file")]+(c.dig("links","agents")||[]); refs.compact.each{|p| abort("missing: #{p}") unless File.file?(p)}; puts "ok"'

# Count agent lines (should be <= 200)
wc -l agents/*.md

# Verify SKILL.md has frontmatter
head -1 SKILL.md | grep -q '^---' && echo '✅ Frontmatter present'
```
