# FastAPI v1 Backend Migration

## Status

Draft. Records the current direction for replacing the v1 Quarkus backend with FastAPI.

## Context

The v1 backend in `backend-v1/` is a Quarkus application backed by PostgreSQL. Its FastAPI equivalent will live in `backend/` and begin with a blank PostgreSQL database. This first step is a backend conversion, not a feature iteration or frontend redesign.

## Decision

Migrate every v1 backend domain and endpoint except shopping lists and shopping-list items. The FastAPI implementation belongs in `backend/`.

The initial migrated domain includes:

- Foodstuff: the reusable food catalog item with nutritional data.
- Recipe: recipe metadata and its aggregate boundary.
- Ingredient: a foodstuff quantity within a recipe.
- Step: an ordered preparation instruction within a recipe.
- Custom users: the application's user records; they do not provide authentication.
- Existing metadata and version endpoints where they remain used by the Angular application.

The migration may correct obvious model, validation, and API issues, but must not add new product features.

## Scope Boundaries

Not migrated in this iteration:

- Shopping lists and shopping-list items.
- Shopping-list endpoints.
- Angular shopping-list cleanup or redesign. It is a separate implementation.

Image storage, gut-health AI, general-purpose agent access, authentication, and all other new features are forbidden in this migration.

## Model Corrections

- Use `Decimal` in the FastAPI domain and schemas where appropriate, with PostgreSQL types chosen for the new schema.
- Treat foodstuff nutrition as the source of truth and derive recipe totals from ingredient quantities and servings. For `G` and `ML` foodstuffs, kcal and macros are per 100 g or 100 ml, so the ingredient quantity is divided by 100. For `PIECE` foodstuffs, kcal and macros are per piece, so the quantity is used directly. Do not introduce a new nutrition-basis feature in this migration.
- Treat missing nutrition values as unknown, not zero. If an ingredient lacks a nutrient value, the corresponding recipe total is unknown.
- Enforce ordered recipe steps and ingredients through explicit ordering fields and appropriate database constraints.
- Preserve the v1 uniqueness constraint allowing a foodstuff only once per recipe. Revisit it only if a future feature adds ingredient-level context.
- Preserve v1 route paths and JSON field names unless an obvious correction requires a change. Use typed FastAPI/Pydantic request and response schemas, including typed partial-update schemas that accept the existing update payload shapes.
- Correct broken v1 HTTP semantics. Missing resources return `404`, and deleting a foodstuff referenced by a recipe returns `409 Conflict` with a clear error response.
- Creating a custom user creates only the user record. It does not create a shopping list.
- Use database migrations and environment-based configuration. Do not carry forward v1's automatic schema updates or wildcard CORS configuration.

## Integration Impact

The FastAPI service replaces the Angular application's v1 backend. The Angular application changes only where necessary to remain compatible with the migrated API. Shopping-list frontend code remains untouched in this migration; broader mobile-first or design work is deferred.

The FastAPI database starts blank. Importing v1 PostgreSQL data is explicitly out of scope until the backend conversion is successful. The initial schema can therefore apply approved corrections without compatibility transformations for existing data.

## Migration Approach

Create a clean FastAPI application structure in `backend/`, separating configuration, database access, SQLAlchemy models, Pydantic schemas, domain services, and routers. Create the schema with database migrations, migrate the non-shopping-list API surface, then make only the Angular changes needed for that contract. Do not clean up shopping-list frontend code.

Use the tracked Compose files in `deployment/` for the FastAPI/PostgreSQL development and test setup. Updating those files is approved as part of the migration.

Add meaningful tests for migrated API contracts, validation, persistence, and derived nutrition calculations. Tests should protect conversion behaviour and corrected edge cases rather than repeat framework mechanics.

## Risks and Open Questions

- Should recipe names remain globally unique?
- Which v1 data mappings and validation rules must a later import preserve?
- After FastAPI cutover, existing shopping-list interactions will be unavailable until their separate frontend and backend implementation is completed.
- Custom users are unauthenticated. This is a known security issue that remains outside this migration and must be resolved before exposing the app or agent API beyond its intended private environment.
