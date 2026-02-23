# 🏭 Dark Factory

**Agentic AI build system with sealed-envelope testing.** Give it a goal — it delivers production-ready, tested code.

Dark Factory orchestrates 5 specialist AI agents through a checkpoint-gated pipeline. A sealed test suite is generated from the spec *before* code is written — building agents never see these tests. The gap between their tests and the sealed tests measures true build quality.

---

## Quick Start

```bash
# Register the skill
/skills add path/to/dark-factory

# Build something (full pipeline)
dark factory — build a CLI tool that validates JSON schemas

# Quick task (express mode)
dark factory express — add input validation to the parser

# Resume after interruption
dark factory resume

# Check status
dark factory status
```

---

## How It Works

```
  You: "Build a CLI skill that analyzes PR quality"
   │
   ▼
┌─ PHASE 0 ─── Factory Setup ───────────────────────┐
│  Create isolated git worktree • Initialize state   │
└────────────────────────┬───────────────────────────┘
                         ▼
┌─ PHASE 1 ─── Product Spec ────── [CHECKPOINT] ────┐
│  🧑‍💼 Product Manager → PRD.md                      │
└────────────────────────┬───────────────────────────┘
                         ▼
┌─ PHASE 2 ─── Arch + Seal (parallel) [CHECKPOINT] ─┐
│  🏗️ Architect → ARCH.md                            │
│  ✉️ QA Sealed → sealed tests 🔒 (hidden)           │
└────────────────────────┬───────────────────────────┘
                         ▼
┌─ PHASE 3 ─── Implementation ──── [CHECKPOINT] ────┐
│  👩‍💻 Engineer → code + open tests                   │
└────────────────────────┬───────────────────────────┘
                         ▼
┌─ PHASE 4 ─── Sealed Validation ── [CHECKPOINT] ───┐
│  🔬 QA Validator → gap analysis (sealed vs open)   │
└────────────────────────┬───────────────────────────┘
                         ▼
┌─ PHASE 5 ─── Hardening (if gaps) ─────────────────┐
│  👩‍💻 Engineer fixes from failure messages (blind)   │
└────────────────────────┬───────────────────────────┘
                         ▼
┌─ PHASE 6 ─── Delivery ────────── [CHECKPOINT] ────┐
│  Approve → merge │ Reject → discard               │
└────────────────────────────────────────────────────┘
```

## The Sealed Envelope

The core innovation. Before any code is written:

1. **QA Sealed agent** reads only the PRD (never code)
2. Writes behavioral tests → stored in a **sealed directory**
3. Building agents **never see these tests**
4. After code is built, sealed tests are run against it
5. The **gap score** (sealed failures / total) measures true quality
6. During hardening, the engineer sees only "test X failed" — never the test code

This prevents "teaching to the test" and measures genuine engineering quality.

## Two Modes

| Mode | When | Phases | Checkpoints |
|------|------|--------|-------------|
| **Full** | New features, projects | 0→1→2→3→4→5→6 | After each phase |
| **Express** | Quick fixes, small tasks | 0→3→4→6 | Delivery only |

## Agent Team

| Agent | Role | Sees |
|-------|------|------|
| Product Manager | Writes PRD from goal | User goal + repo context |
| Architect | Designs system | PRD only |
| QA Sealed | Writes hidden tests | PRD only (never code) |
| Lead Engineer | Implements code + tests | PRD + Architecture (never sealed tests) |
| QA Validator | Runs all tests, gap analysis | Everything |

## Configuration

Edit `config.yml` to tune:
- Default mode (full/express)
- Model routing per agent (Speed Stack)
- Max hardening cycles
- Checkpoint gates

---

## License

MIT
