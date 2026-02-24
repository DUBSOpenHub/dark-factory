# Architecture Document

## Overview
{one_paragraph_summary}

## System Design

### Components
| Component | Responsibility | Files |
|-----------|---------------|-------|
| {name} | {what_it_does} | {file_paths} |

### Data Flow
```
{input} → {component_1} → {component_2} → {output}
```

## Technology Choices
| Choice | Why |
|--------|-----|
| {tech} | {rationale} |

## File Structure
```
{project_root}/
├── {dir}/
│   ├── {file}
│   └── {file}
└── {file}
```

## Integration Points
- {integration_1}: {how_it_connects}
- {integration_2}: {how_it_connects}

## Security Considerations
- {security_item_1}
- {security_item_2}

## Error Handling Strategy
- {error_scenario}: {how_handled}

## API Contracts

### {endpoint_name}
- **Method:** {HTTP_METHOD}
- **Path:** {path}
- **Request:** `{request_schema}`
- **Response 200:** `{response_schema}`
- **Response 4xx/5xx:** `{error_schema}`

## Data Schemas

### {EntityName}
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| {field} | {type} | {yes/no} | {description} |

## Interface Definitions

### {module_name}
```
{function_signature}
```

## Sequence Diagrams

### {flow_name}
```
{actor_1} → {actor_2} → {actor_3}
  1. {step_1}
  2. {step_2}
  3. {step_3}
```

<!--
Example (filled in):
## Overview
CLI auditor parses dependency manifests, normalizes licenses, and writes reports.

## System Design
### Components
| Component | Responsibility | Files |
| CLI Runner | Parse args, orchestrate scan | src/cli.ts |
| Manifest Parser | Load manifests | src/parsers/*.ts |
| Report Engine | Render tables/CSV | src/report.ts |

### Data Flow
manifest → parser → normalized graph → reporter → console/CSV

## Technology Choices
| Choice | Why |
| Node.js | Existing tooling, cross-platform |

## File Structure
```
src/
  cli.ts
  parsers/
    package-lock.ts
```

## Integration Points
- GitHub REST API: fetch license metadata

## Security Considerations
- Never execute manifest scripts

## Error Handling Strategy
- Wrap IO errors and exit with non-zero status

## API Contracts
### CLI
- **Command:** `df-lic scan <path>`
- **Response:** stdout table + optional CSV

## Data Schemas
### LicenseFinding
| Field | Type | Required | Description |
| name | string | yes | Dependency id |

## Interface Definitions
### ReportEngine
```
interface ReportEngine {
  renderTable(findings: LicenseFinding[]): string;
}
```

## Sequence Diagrams
### Scan Flow
```
User → CLI → Parser → Reporter → User
 1. User runs CLI
 2. Parser loads manifests
 3. Reporter prints summary
```
-->

<!--
WORKED EXAMPLE:
# Architecture Document

## Overview
A Python CLI tool using `argparse` to accept an integer and print the Fibonacci number.

## System Design
### Components
| Component | Responsibility | Files |
|-----------|---------------|-------|
| CLI Parser | Handle user input | `main.py` |
| Core Logic | Calculate sequence | `fib.py` |

### Data Flow
User Input (Int) -> ArgParse -> fib() -> Stdout
-->
