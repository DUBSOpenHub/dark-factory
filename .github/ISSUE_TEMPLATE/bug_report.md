---
name: Bug report 🐛
about: Report a defect in the factory line (pipeline, prompts, CI)
title: "[BUG] "
labels: bug
assignees: ""
---

## Summary

A clear, one-paragraph description of the bug.

## Where did it fail?

- **Mode:** full / express
- **Phase:** 0 / 1 / 2 / 3 / 4 / 5 / 6 / 7
- **Run ID:** `run-YYYYMMDD-HHMMSS` (from the factory banner)
- **Checkpoint choice (if relevant):** approve / modify / skip-all / abort

## Steps to reproduce

1. Run: `dark factory "..."` (paste the exact goal)
2. Approve checkpoints: (list what you clicked)
3. Observe: (what happened)

## Expected behavior

What should have happened instead?

## Actual behavior

What happened? Include the most relevant output.

```text
(paste output here)
```

## Sealed-envelope integrity check (required)

- [ ] The Lead Engineer never saw sealed test code
- [ ] The user was never shown sealed test code before validation
- [ ] Hardening included only failure messages (no test source)

If any of the above are false, treat this as a potential security issue and also follow **SECURITY.md**.

## Environment

- OS:
- GitHub Copilot CLI version:
- Dark Factory version: 0.1.0

## Additional context

- Relevant `config.yml` changes (if any):
- Repo stack (Node/Python/Go/etc):
