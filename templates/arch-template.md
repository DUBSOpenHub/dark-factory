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
