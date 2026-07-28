# Red Team Report Template

> Produced by the Red Team (`security-review`) in Phase 4.5, **after** the Shadow Score is
> computed and **after** the sealed envelope is opened. Written to `RED-TEAM.md`.
>
> The sealed suite asks "does it do what the spec says". The red team asks "what else does it
> do". Those are different questions, and only one of them finds the vulnerability.

---

```markdown
# Red Team Report

**Target:** {branch or commit}
**Reviewer:** {model} ({family})
**Breach Score:** {N} high / {N} medium / {N} low

## Breach Score

    Breach Score = count of exploitable findings by severity

Unlike the Shadow Score, lower is not automatically better — a Breach Score of 0 on a
codebase with no attack surface is uninformative. Report the surface you examined.

## Attack Surface Examined

| Surface | Examined | Notes |
|---------|----------|-------|
| Untrusted input parsing | ✅ | {what} |
| Authentication / authorization | ✅ | {what} |
| Injection (SQL, command, template, path) | ✅ | {what} |
| Deserialization | ⬜ | not present |
| Secrets handling | ✅ | {what} |
| Dependency supply chain | ✅ | {what} |
| Resource exhaustion / DoS | ✅ | {what} |
| Error paths leaking internals | ✅ | {what} |

State what you did **not** examine. An unexamined surface is not a clean surface.

## Findings

### [{SEVERITY}] {Title}

- **Class:** {spec gap | implementation bug}
- **Location:** `{file}:{line}`
- **Attack:** {concrete steps an attacker takes}
- **Impact:** {what the attacker gains}
- **Evidence:** {the input, the response, the code path}
- **Fix:** {the specific change}

### Finding class matters

| Class | Meaning | Feeds back into |
|-------|---------|-----------------|
| **spec gap** | The PRD never required this defence. The code is correct per spec. | Product Manager memory (Loop A) — the *spec* is the defect |
| **implementation bug** | The spec required it; the code got it wrong. | Lead Engineer hardening (Phase 5) |

Misclassifying a spec gap as an implementation bug sends the engineer to fix code that is
already correct. The distinction is the whole value of running this after the seal opens.

## Severity

| Severity | Criterion |
|----------|-----------|
| `high` | Remotely exploitable, or leads to data loss / privilege escalation / secret disclosure |
| `medium` | Exploitable with preconditions (local access, authenticated user, specific config) |
| `low` | Defence-in-depth weakness; no direct exploit path demonstrated |

Only report findings you can **demonstrate**. A theoretical concern with no attack path is a
note, not a finding.

## Gate

`config.gates.red_team_high_findings_max` (default `0`). Exceeding it breaches the gate.
```

---

## Example

```markdown
# Red Team Report

**Target:** factory/run-20260728-1030
**Reviewer:** gpt-5.6-sol (openai)
**Breach Score:** 1 high / 1 medium / 0 low

## Attack Surface Examined

| Surface | Examined | Notes |
|---------|----------|-------|
| Untrusted input parsing | ✅ | CSV import path, 40MB fixture |
| Injection | ✅ | Filename → shell, filename → SQL |
| Secrets handling | ✅ | No secrets in repo; env var read is correct |
| Deserialization | ⬜ | not present |

## Findings

### [HIGH] Path traversal via CSV `attachment` column

- **Class:** spec gap
- **Location:** `src/importer.py:88`
- **Attack:** Import a CSV whose `attachment` column contains `../../../../etc/passwd`.
  The importer joins it to the storage root with no normalisation.
- **Impact:** Arbitrary file read outside the storage directory.
- **Evidence:** `import(csv)` → response body contains `root:x:0:0:`
- **Fix:** Resolve the joined path and assert it stays under the storage root; reject otherwise.

The PRD says "store the referenced attachment". It never says "and only from within the
storage root". The engineer implemented the requirement as written — the **requirement** is
the defect. Route to the Product Manager, not to hardening.

### [MEDIUM] Import failure returns the full traceback to the caller

- **Class:** implementation bug
- **Location:** `src/api.py:41`
- **Attack:** Submit a malformed CSV.
- **Impact:** Response discloses absolute filesystem paths and library versions.
- **Evidence:** 500 body includes `/Users/ci/work/src/importer.py`, `pandas 2.4.1`
- **Fix:** Log the traceback; return a generic error with a correlation id.
```
