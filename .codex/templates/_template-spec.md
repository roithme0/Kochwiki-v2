# Spec Template

Use this template to create new standardized specs in the project's spec directory.

This template is intentionally self-contained so it can be shared and reused by humans and assistants.
All spec-authoring instructions should live in this file.

## Naming Convention

- File name format: `YYYY-MM-DD-<short-kebab-title>.md`
- Keep names short and descriptive.

Example:
- `2026-04-18-indexing-improvements.md`

## Header Block (Required)

Copy and fill this block at the top of each new spec:

```md
# <Spec Title>

Date: YYYY-MM-DD
Type: implementation | umbrella
Related specs: <optional list of spec filenames, or "None">
```

## Authoring Rules (Required)

1. Keep scope explicit and small enough for reviewable implementation slices.
2. Separate `Scope` and `Non-Goals` clearly.
3. Keep API and behavior contracts concrete and testable.
4. Use stable wording for response and error semantics.
5. Avoid embedding implementation plan/checklist in the spec body.
6. If an open question is resolved, remove the question in the next spec revision.
7. Use this template for new specs. Existing specs can remain content-unchanged unless intentionally revised.

## Multi-Spec Split Rules (Required)

- If work impacts only one service, create one `Type: implementation` spec for that service.
- If work impacts multiple services, create:
  - One `Type: umbrella` coordination spec in `docs/specs/cross-service/`.
  - One `Type: implementation` spec per impacted service.
- The umbrella spec must list all related service implementation spec filenames in `Related specs`.
- Each service implementation spec must reference the umbrella spec filename in `Related specs`.

## Cross-Service Contract Rules (Required)

- When multiple services are impacted, the umbrella spec is the single source of truth for the cross-service API contract.
- Service implementation specs must not duplicate full cross-service contract details; they must reference the umbrella contract and describe only service-local implications.
- The umbrella API contract must define, when applicable:
  - Endpoints/events affected.
  - Request/response schema expectations (required/optional fields).
  - Error/status semantics.
  - Compatibility/cutover expectations for contract changes.

## Spec Placement Rules (Required)

- Place specs under service-based folders:
  - `docs/specs/<service-name>/` for service-specific implementation specs.
  - `docs/specs/cross-service/` for umbrella coordination specs spanning multiple services.
- Place each implementation spec in its impacted service folder (`docs/specs/<service-name>/`).
- Place umbrella specs in `docs/specs/cross-service/`.

## Section Skeleton: Implementation Spec

Use this section set when `Type: implementation`.

```md
## Goal

<What outcome this spec delivers and why it matters now.>

## Scope

- <In-scope item 1>
- <In-scope item 2>

## Non-Goals

- <Out-of-scope item 1>
- <Out-of-scope item 2>

## Contract

<API/DTO/events/storage contract changes or explicit "No contract changes".>

## Contract Conformance

<If an umbrella spec exists: reference its API contract section and list only service-local implementation implications. Otherwise: "Not applicable".>

## Behavior

<Runtime behavior, error semantics, fallback behavior, and integration notes.>

## Testing

- <Required tests by impacted layer/component, or "None">

## Acceptance Criteria

1. <Verifiable acceptance criterion 1>
2. <Verifiable acceptance criterion 2>

## Risks

- <Known risk 1>
- <Deferred item 1>

## Open Questions

- <Question 1, or "None">
```

## Section Skeleton: Umbrella Spec

Use this section set when `Type: umbrella`.

```md
## Goal

<High-level direction and intended outcome.>

## Scope

- <What this umbrella defines>

## Non-Goals

- <What this umbrella intentionally does not define>

## Direction

<Finalized architecture/product direction at high level.>

## API Contract (Cross-Service)

<Cross-service API contract source of truth. Define endpoints/events, request/response schema, error semantics, and compatibility/cutover expectations.>

## Spec Split and Sequencing

1. <Sub-spec A>
2. <Sub-spec B>
3. <Sub-spec C>

## Dependency Order

1. <Order rule 1>
2. <Order rule 2>

## Risks

- <Cross-cutting risks>

## Open Questions

- <Question 1, or "None">
```

## Final Self-Check (Required Before Publishing)

- Filename follows `YYYY-MM-DD-<short-kebab-title>.md`.
- Header block is present and filled.
- `Type` is explicitly set (`implementation` or `umbrella`).
- Required section skeleton for the chosen type is fully present.
- `Scope` and `Non-Goals` do not overlap.
- Contract statements are concrete (or explicitly unchanged).
- For multi-service work, umbrella spec contains the cross-service API contract and implementation specs reference it via `Contract Conformance`.
- Acceptance criteria are testable and unambiguous.
- Open questions are real unresolved items, or explicitly `None`.
- Multi-spec split and placement rules are satisfied for the impacted services/layers.
