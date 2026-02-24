# Product Requirements Document

## Goal
{one_sentence_goal}

## Problem Statement
{what_problem_does_this_solve}

## User Stories

1. As a {persona}, I want to {action}, so that {outcome}.
2. ...

## Success Criteria

- [ ] {measurable_criterion_1}
- [ ] {measurable_criterion_2}
- [ ] ...

## Scope

### In Scope
- {feature_1}
- {feature_2}

### Out of Scope
- {excluded_1}
- {excluded_2}

## Acceptance Criteria

### {Feature 1}
- Given {context}, when {action}, then {result}
- Given {context}, when {action}, then {result}

### {Feature 2}
- Given {context}, when {action}, then {result}

## Technical Constraints
- {constraint_1}
- {constraint_2}

## Open Questions
- {question_1}

## Strategic Context

### Objective
{objective_this_maps_to}

### Key Results
1. {key_result_1}
2. {key_result_2}
3. {key_result_3}

### KPIs
| KPI | Baseline | Target | Measurement Method |
|-----|----------|--------|-------------------|
| {kpi_name} | {current} | {target} | {how_measured} |

## Stakeholder Map

| Stakeholder | Interest | Impact Level |
|-------------|----------|-------------|
| {stakeholder} | {what_they_care_about} | {High/Med/Low} |

## Market Context
{competitive_landscape_and_prior_art}

<!--
Example (filled in):
## Goal
Ship a cross-repo dependency auditor CLI that flags GPL dependencies.

## Problem Statement
Enterprise release managers need an automated way to detect GPL/LGPL licenses before shipping.

## User Stories
1. As a release manager, I can scan a repo and receive a license summary within 60 seconds.
2. As a security engineer, I can export the findings to CSV for audits.

## Success Criteria
- [ ] Scan completes under 1 minute for <10k files
- [ ] Reports list dependency, version, license, and risk rating

## Scope
### In Scope
- CLI ingestion of package-lock.json and requirements.txt
- Risk rules for GPL/LGPL

### Out of Scope
- Remediation PRs
- UI dashboards

## Acceptance Criteria
### License Scan
- Given a repo with package-lock.json, when I run `df-lic scan`, then a summary table is printed with risk tiers.
- Given GPLv3 dependency, when scan finishes, then exit code is 2 with remediation guidance.

## Technical Constraints
- Implemented in TypeScript
- Must run on macOS and Linux

## Strategic Context
### Objective
Reduce compliance review time by 40%.

### Key Results
1. Flag 100% of GPL dependencies pre-release.
2. Generate CSV reports with <5% false positives.

### KPIs
| KPI | Baseline | Target | Measurement Method |
| License review time | 5 days | 3 days | PMO tracker |

## Stakeholder Map
| Stakeholder | Interest | Impact Level |
| Release Manager | Risk reduction | High |

## Market Context
Existing scanners require full builds; Dark Factory offers sealed QA and CLI ergonomics.
-->

<!--
WORKED EXAMPLE:
# Product Requirements Document

## Goal
Build a Python script that calculates Fibonacci numbers.

## Problem Statement
Users need a way to quickly find the Nth Fibonacci number without manual calculation.

## User Stories
1. As a student, I want to input N and get the Nth Fibonacci number, so I can verify my homework.

## Success Criteria
- [ ] Correctly calculates F(0) through F(100).
- [ ] Handles negative input gracefully.

## Scope
### In Scope
- CLI interface
- Error handling for non-integers

### Out of Scope
- Web UI
- API
-->
