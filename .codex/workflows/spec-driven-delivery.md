# Spec-Driven Delivery Workflow

## Global Rules

- **Clarification batch limit**: Ask no more than 3 clarifying questions at a time. If more clarifications are needed, ask them in batches of 3 and only continue with the next batch after the previous answers are clarified.
- **Explicit step gate**: Do not proceed to the next workflow phase until the user explicitly says so. `go`, `approved`, and `continue` are equivalent approvals.

## Workflow Phases

1. **Sparring phase**: Collaboratively develop the concept in chat until scope and behavior are clear. Before requesting user confirmation, ask all clarifying questions required to draft the spec, following the clarification batch limit.
2. **Spec phase**: Document the agreed sparring result in a spec file before implementation planning.
3. **Spec review phase**: Before requesting user review, the assistant must review and double-check the created spec file(s). Spawning subagents is allowed for this review. Surface review findings first alongside required clarifying questions required for you to refine the spec, then request explicit user review of the spec file(s) and discuss details before suggesting a step-by-step implementation plan.
4. **Plan phase**: Document a step-by-step implementation plan derived from the approved spec file in a markdown file under `docs/plans/`. The `plans` folder lives alongside `docs/specs/`.
5. **Implementation phase**: Execute exactly one planned step at a time. Keep the plan file up to date by marking each step state (`todo` or `done`) and, for implemented steps, adding brief implementation notes only when there is something noteworthy to record.
6. **Codebase review phase**: After all planned steps are complete, revisit touched and impacted code from a broader codebase perspective. Check for dead code, code bloat, duplication, misplaced responsibilities, and folder or module structure drift. Surface findings and discuss them with the user.

## Spec Review Requirements

- Review created and related spec file(s) together, not in isolation.
- Check for incompatibilities between related specs.
- Check for conflicts between the spec(s) and the existing codebase, architecture, or established contracts.
- Check for missing required details and insufficiently specified behavior.
- Explicitly look for underspecified contracts, edge cases, error handling, testing expectations, and acceptance criteria.
- Surface findings and unresolved gaps before asking the user for review.

## Codebase Review Output Format

- Start with a `Status` line: `no findings` or `findings`.
- If findings exist, present them as an enumerated list (`1.`, `2.`, `3.`) and include for each item:
  - `Type`: `dead code`, `bloated code`, `duplication`, `misplaced code`, `structure drift`, ...
  - `Location`
  - `Why it matters`
  - `Suggested follow-up`

## Implementation Plan Format

Document implementation plans in a markdown file under `docs/plans/`.

Present implementation plans as a table by default.

- Plan file names must follow `YYYY-MM-DD-<short-kebab-title>-plan.md`.
- Plan steps must be small enough to review independently.
- Include a `State` column for each step and use `todo` and `done` as the step states.
- Include an `Implementation Notes` column. Keep notes brief and compact, and only record noteworthy items such as deviations from the plan or spec, risks, or refactoring opportunities.
- If scope changes during implementation, suggest returning to sparring/spec review and to update the spec and plan before continuing implementation.

| Step | State | Change | Output | Implementation Notes |
| --- | --- | --- | --- | --- |
| 1 | todo | Implement the first backend change required by the approved spec. | The backend behavior for this step is implemented and ready for review. | - |
| 2 | todo | Implement the first frontend or integration change required by the approved spec. | The corresponding consumer-facing or cross-layer behavior for this step is implemented and ready for review. | - |

## Spec Authoring Guardrail

- New specs must be created from `.codex/templates/_template-spec.md`.
- Do not define separate spec-authoring process rules outside the template; keep them centralized in the template file.
