## Summary

What does this PR change? Link issues.

Fixes #

## Type

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] CI / Infra

## Factory impact

- Affects phases: 0 / 1 / 2 / 3 / 4 / 5 / 6 / 7
- Agent prompts touched (if any):

## QA checklist (from docs/TESTING.md)

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

## Notes for reviewers

Anything risky, subtle, or worth double-checking?
