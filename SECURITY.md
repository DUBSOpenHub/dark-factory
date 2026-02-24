# Security Policy 🔒

## Supported Versions

| Version | Supported |
| ------- | --------- |
| v0.1.x  | ✅ |
| < v0.1  | ❌ |

## Reporting a Vulnerability

**Do not open a GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in Dark Factory (for example: sealed-envelope leakage, prompt injection susceptibility, or context contamination), please report it privately.

### Preferred channel

- **GitHub Security Advisories** (if enabled on the repository)

### Alternative channel

- Email: `security@dubsopenhub.com`

### What to include

- A clear description of the issue
- Steps to reproduce
- Potential impact (what could be exposed or compromised)
- Any proof-of-concept artifacts (safe to share)

## Response Timeline

- **Acknowledgment:** within 24 hours
- **Assessment:** within 72 hours
- **Resolution:** depends on severity; critical issues are prioritized for the next release

## Scope

**In scope:**

- Sealed-envelope integrity (tests not revealed to the implementation agent)
- Prompt safety and injection resistance
- Worktree isolation and cleanup safety

**Out of scope:**

- Vulnerabilities in GitHub Copilot CLI itself
- Vulnerabilities in underlying LLM providers
- User-generated goals that produce unsafe code (users must review generated code before running it)
