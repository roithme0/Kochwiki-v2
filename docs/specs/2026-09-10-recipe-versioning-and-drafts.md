# Recipe Versioning and Drafts

Status: implemented
Date: 2026-09-10
Related concept: None
Related specs: None

## Outcome

Users can iterate on recipes without losing a previously published state. Each recipe has one immutable active version, retains earlier active versions as immutable history, and may have multiple mutable drafts that can be refined, published, or discarded. The same lifecycle provides the persistence foundation for later AI-assisted recipe proposals while keeping publication under explicit user control.

## Scope

- Introduce a stable recipe lineage containing exactly one active version, zero or more historical versions, and zero or more drafts.
- Let an edit of the active version be published directly or saved as a new draft.
- Let an existing draft be updated in place, published through a separate action, or discarded.
- Preserve prior active versions and expose version relationships and history through the backend.
- Show active versions and drafts as individual recipe-grid entries, with a subtle but accessible draft treatment.
- Migrate existing recipes into the versioned model without losing recipe content.
- Do not add draft filtering, lineage grouping, history UI, diff UI, rollback, AI integration, draft provenance, or draft-origin tracking.
- Do not allow creating a recipe without an initial active version.

## Experience and UI Direction

Creating a recipe retains the existing single-save flow and creates its initial active version. There is no save-as-draft option during creation.

Editing an active recipe presents two actions:

- **Speichern** publishes the submitted content directly as a new active version.
- **Als Entwurf speichern** creates a new mutable draft while leaving the active version unchanged, then takes the user to that draft.

Editing a draft presents **Entwurf speichern** only. This updates the same draft in place. Publishing is deliberately separated from editing: the draft detail page provides **Als aktive Version übernehmen**. Activating it requires confirmation that the current active version will move to history and that other drafts will remain. After successful publication, the user is taken to the active recipe detail. A failed save or publication leaves the editor or draft available and communicates the failure without partially changing the lifecycle.

The recipe grid contains one entry per active version and one per draft; historical versions do not appear. Entries are sorted by last-modified time, newest first. Draft cards show a subdued textual **Entwurf** badge and their locally formatted last-modified date and time. The draft state must not be conveyed through color alone. Active cards otherwise retain their established visual treatment. A deterministic secondary order may be used for equal timestamps.

Selecting a card opens that exact active version or draft. A draft detail page must clearly identify its draft state so that its edit, publish, and discard actions cannot be mistaken for operations on the active recipe. Search continues to include every active and draft entry. Filtering by state, visually grouping related entries, showing history, and comparing versions are deferred.

The interaction remains mobile-first, uses the established Angular Material patterns, and keeps all status labels and lifecycle actions accessible by touch, keyboard, and assistive technology. Submission actions must prevent accidental duplicate requests while an operation is in progress.

## Decisions and Behavior

- A recipe lineage has a stable identity and exactly one active version throughout ordinary operation.
- Lineage-level data is limited to stable identity, creation metadata, lifecycle relationships, and future ownership or access-control concerns. It has no separate display name.
- All editable recipe content belongs to a version: name, servings, preparation time, origin information, ordered ingredient references and amounts, and ordered preparation steps.
- Recipe names are not unique. Duplicate names are valid across lineages and among versions or drafts of the same lineage.
- Active and historical versions are immutable. Editing active content always creates another version.
- Drafts are complete, valid recipes and use the same content validation as published versions. Incomplete recipes cannot be persisted as drafts.
- Saving an active edit directly creates a new active version and moves the previously active version to history atomically.
- Saving an active edit as a draft creates an additional draft and does not change the active version or any existing draft.
- Saving an existing draft mutates that draft in place. Intermediate draft states are not retained as history.
- Publishing a draft atomically moves the currently active version to history and changes the selected draft to active without changing its version ID.
- Publishing one draft never deletes or modifies alternative drafts.
- Drafts do not record which version they originated from. If the active version changes, remaining drafts continue to belong to the lineage without becoming stale, rebasing, or emitting a warning.
- Discarding a draft deletes only that draft. Historical versions cannot be deleted individually.
- Deleting the active recipe means deleting the complete lineage, including its active version, drafts, and history, after an explicit lineage-wide warning.
- A version snapshots recipe-owned content only. Ingredient entries retain references to shared foodstuffs rather than copying foodstuff names or nutrition.
- Derived nutrition is calculated from the current referenced foodstuff data. Historical nutrition output may therefore change when a foodstuff changes even though the historical recipe-owned content is immutable.
- Every recipe version, including historical versions, continues to count as a foodstuff reference. A referenced foodstuff cannot be deleted while any such version exists.

## Contract

The backend distinguishes the stable recipe identity from an individual version identity:

- `recipeLineageId` identifies the UUIDv4 lineage and remains stable across active, historical, and draft versions.
- `recipeVersionId` is an opaque, server-generated UUIDv4. It is not a version number and carries no ordering semantics.
- `state` is `active`, `draft`, or `historical`.
- `createdAt` and `lastModified` are server-controlled, timezone-aware timestamps exposed in an unambiguous ISO 8601 form.

Every returned version includes these identity and lifecycle fields alongside its complete recipe content. Active and historical versions retain their publication time as `lastModified`. Draft updates advance `lastModified`; publishing a draft advances it to the publication time. Moving the previous active version to history does not make that older content appear newly modified.

The backend provides distinct operations for:

- creating a lineage with its initial active version;
- publishing an edit of the active version directly;
- creating a draft for an existing lineage;
- updating a draft without publishing it;
- publishing a selected draft;
- discarding a selected draft;
- deleting a complete lineage;
- listing the active version and drafts used by the normal recipe UI; and
- listing and retrieving the complete historical versions of a lineage.

Lifecycle-changing operations must reject attempts to mutate historical versions or to use a version from another lineage. Draft update and publication are separate contract operations so a client cannot publish merely by choosing a different field value in an otherwise identical update request.

Normal recipe listing excludes historical versions and returns the active versions and drafts needed by the grid. History is returned newest first and each historical version remains individually retrievable. Complete version representations make a later client-side comparison against the then-current active version possible; the backend does not need to calculate or persist a diff in this change.

## Constraints

- Publication must be transactional: a successful operation leaves exactly one active version, while a failure preserves the prior active version and draft state.
- The migration remaps existing numeric recipe IDs to UUIDv4 lineage IDs and creates UUIDv4 active version IDs. Recipe-owned content and ingredient/step relationships are preserved; old numeric recipe URLs are intentionally not retained because this undeployed internal contract changes with the migration.
- Existing recipes migrate to one active version with unchanged recipe-owned content. Because the current schema has no timestamps, migrated lineages and versions use the migration time for their creation and last-modified values.
- The existing global recipe-name uniqueness constraint is removed.
- Referential integrity covers ingredient references in drafts and history as well as the active version. Foodstuff deletion remains blocked until every referencing recipe lineage is deleted.
- Backend and frontend contract changes ship together; no legacy update-contract compatibility is required for an external consumer.
- This change does not require build or tooling configuration changes.

## Acceptance Criteria

1. Creating a recipe produces a lineage with one valid active version and offers no draft option in the creation flow.
2. Directly saving an active-recipe edit creates a new active version with a UUID, preserves the prior active content as an immutable historical version, and never exposes two active versions.
3. Saving an active-recipe edit as a draft creates a separate valid draft, leaves the active version unchanged, and opens the created draft.
4. A lineage can hold multiple concurrent drafts, including drafts with identical names.
5. Saving a draft changes that draft in place, advances its last-modified timestamp, and does not create history or publish it.
6. A draft can be published only through the distinct confirmed activation action; publication preserves its version ID, archives the current active version, and leaves alternative drafts unchanged.
7. Publishing a draft created before the current active version succeeds without rebasing or an origin warning.
8. A failed direct publication or draft publication leaves exactly the previously active version active and does not partially mutate the selected draft or history.
9. Discarding a draft removes only that draft. Deleting an active recipe warns about and removes its entire lineage, including drafts and history.
10. Active and historical versions reject content mutation, and historical versions cannot be deleted individually.
11. The normal recipe list returns and displays active versions and drafts but no historical versions.
12. The grid is ordered by last-modified time descending. Each draft card has an accessible textual draft badge and a localized last-modified date and time, and selecting it opens that exact draft.
13. Search continues to match active and draft entries without adding state filters or lineage grouping.
14. The backend exposes stable UUID `recipeLineageId` and UUID `recipeVersionId` fields, lifecycle state, timestamps, full version content, and retrievable history sufficient for a later diff UI.
15. No response or persisted relationship claims which active or historical version a draft was based on.
16. Duplicate recipe names are accepted for active versions, drafts, and separate lineages.
17. Updating a shared foodstuff affects derived nutrition for every referencing version, while recipe-owned historical content remains unchanged.
18. Foodstuff deletion is blocked when the foodstuff is referenced only by a draft or historical version, as well as when referenced by an active version.
19. Existing numeric recipes migrate into valid UUID lineages and active UUID versions with their content and ingredient/step relationships preserved; old numeric URLs are intentionally not preserved.

## Risks

- Because draft origins are not retained, the system cannot later reconstruct which version a draft originally copied or distinguish an intentionally old alternative from an overlooked draft. A future origin-aware diff or rebase feature will require new data and cannot reconstruct it retroactively.
- Mutable drafts intentionally have no edit history. Concurrent writers use the final persisted draft state; richer conflict handling is deferred until an actual multi-writer workflow requires it.
- Historical ingredient references preserve recipe integrity but can prevent foodstuff cleanup indefinitely. A future archival or snapshot policy must address this before referenced foodstuffs can be removed safely.
- Derived historical nutrition is not a point-in-time snapshot because foodstuff data remains live.
- The ecosystem planning initiative describes a broader diff experience. This delivery intentionally supplies only the version data needed for a later comparison UI.
