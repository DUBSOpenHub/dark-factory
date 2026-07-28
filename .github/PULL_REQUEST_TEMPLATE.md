## Summary

What does this PR change? Link issues.

Fixes #

## Type

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] CI / Infra

## Factory impact

- Affects phases: 0 / 1 / 2 / 2.5 / 3 / 4 / 4.5 / 5 / 6 / 7
- Agent prompts touched (if any):
- Does this change `config.yml` invariants, roles, or families? **yes / no**

## QA checklist (from docs/TESTING.md)

**Independence (Level 4)**

- [ ] 🧬 Phase 0 prints the invariant table and the resolved family of every role
- [ ] 🧬 Seal author and implementer are in **different** families
- [ ] 🧬 A same-family config aborts the run (or warns, per `invariants.on_violation`)
- [ ] 🧬 Every dispatch omits `reasoning_effort` / `context_tier` for models that lack them
- [ ] 🧬 `python3 .github/scripts/validate_conformance.py` passes

**Sealed envelope**

- [ ] 🔒 Sealed tests generated from PRD only (never from code/arch)
- [ ] 🔒 SHA-256 hash of the sealed envelope displayed at Phase 2
- [ ] 🔒 Vault is outside the build worktree; validation uses a disposable verify worktree
- [ ] 🔒 Hardening sends failure messages only (test source never revealed)

**Pipeline**

- [ ] 🏭 Factory banner displays on start (run ID, mode, agent lineup)
- [ ] 📋 PRD.md, 🏗️ ARCH.md, 🧐 ARCH-CRITIQUE.md, ❓ AMBIGUITY.md produced
- [ ] 📊 SHADOW-REPORT.md **and** SHADOW-REPORT.json produced
- [ ] 🗡️ RED-TEAM.md classifies findings spec-gap vs implementation-bug
- [ ] 📈 `initial_shadow_score` recorded before cycle 1; `hardening_velocity` reported

**Control**

- [ ] 🚦 Gates print measured value, threshold, and evidence on breach
- [ ] 📋 Checkpoints use `ask_user` with exactly 4 choices
- [ ] ⏭️ Skip-all still enforces gates and still shows final delivery checkpoint
- [ ] 💾 state.json written on every phase transition, including gate results
- [ ] 🔄 Resume works; 🛑 Abort cleans up worktrees, branches, and the vault
- [ ] ⚡ Express mode skips PRD/arch — but never skips gates
- [ ] 🗄️ SQL tables track runs, phases, gates, costs, and learning memory

## Notes for reviewers

Anything risky, subtle, or worth double-checking?
