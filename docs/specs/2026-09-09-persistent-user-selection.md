# Persistent User Selection and Account Menu

Status: implemented
Date: 2026-09-09
Related concept: None
Related specs: None

## Outcome

The app remembers the selected user across browser sessions, reducing repeated user selection on a personal device. User switching remains readily available without occupying a prominent header action or implying that the current user selection is secure authentication.

## Scope

- Persist and restore the selected user for the current browser profile until the user explicitly switches users or the selected user is confirmed to no longer exist.
- Replace the prominent logout action with an account-oriented overflow menu in the existing page header.
- Preserve the current user-selection flow for choosing and creating users.
- Do not introduce passwords, authentication, authorization, server-side sessions, or security claims.
- Do not add settings functionality or a placeholder settings action.

## Experience and UI Direction

When a user has been selected, the right side of the existing page header shows a conventional vertical-more icon instead of the logout icon. Its accessible name communicates that it opens user options.

Opening the menu identifies the currently selected user and offers one action, **Benutzer wechseln**. The identity is informational rather than an additional action. Selecting **Benutzer wechseln** clears the active selection, closes the menu, and opens the existing user-selection page.

The menu must be usable by touch, keyboard, and assistive technology, follow the established Angular Material styling, and fit the mobile-first header without obscuring the page title or existing navigation actions. No account-menu trigger is shown when no user is selected.

Restoring a remembered user is silent; it must not show a fresh-login notification on every app launch. Explicitly selecting a user may retain the existing confirmation feedback.

## Decisions and Behavior

- A selected user remains remembered indefinitely within the current browser profile. It is not shared across browsers or devices.
- The remembered identity is matched against the backend by stable user ID. The backend remains the source of truth for current user data, including the username.
- On startup, a remembered selection may be restored immediately while it is reconciled with the backend. A successful reconciliation refreshes locally held user details.
- If the backend confirms that the remembered user no longer exists, the app clears the remembered and active selection and navigates to the user-selection page.
- A transient backend or network failure must not erase the remembered selection or be treated as confirmation that the user was deleted. Existing page-level failure handling remains responsible for unavailable backend data.
- Explicitly selecting a different user replaces the remembered selection.
- **Benutzer wechseln** has the clearing and navigation behavior of the current logout operation. The UI must not call this action login, logout, or authentication.
- Existing session-cookie selections are not migrated. After upgrading, affected users select themselves once to establish the persistent selection.

## Contract

The browser stores a non-secret reference to the selected user in persistent, origin-scoped storage. The stable user ID is the identity key; any stored username or other user fields are cached display data only and must not override backend data after reconciliation.

Clearing or invalidating the selection removes the persistent record. No backend API contract changes are required.

## Constraints

- The persisted selection is a convenience preference, not proof of identity. It must not be used to authorize backend operations.
- Persistent browser storage access must remain safe when storage is unavailable or contains malformed data.
- Stored data must contain no credentials, tokens, or other secrets.
- This change must not require build or tooling configuration changes.

## Acceptance Criteria

1. After selecting a user, closing and reopening the browser restores that user after client-side initialization without a fresh-login notification.
2. Reloading the app and opening it in a later browser session preserves the selection until the user explicitly chooses **Benutzer wechseln**.
3. A restored user is reconciled by ID; if the username changed, the current backend username is shown without requiring reselection.
4. If reconciliation confirms that the stored user no longer exists, the selection is removed and the user-selection page is shown.
5. If reconciliation fails because the backend or network is temporarily unavailable, the stored selection remains available for a later retry.
6. Malformed or unavailable persistent browser storage does not break startup.
7. Auth-guarded routes continue to redirect to the user-selection page when there is no active or remembered user.
8. When a user is active, the header displays an accessible vertical-more menu trigger in place of the logout button.
9. The opened menu identifies the active user and contains **Benutzer wechseln**, with no settings placeholder.
10. Choosing **Benutzer wechseln** clears all remembered-selection data and navigates to the existing user-selection page; a subsequent browser restart does not restore the cleared user.
11. The menu works with touch, keyboard navigation, and assistive technology on supported mobile and desktop layouts.

## Risks

- Anyone with access to the same browser profile can assume any listed user because this remains user selection without authentication. This change deliberately does not mitigate that existing limitation.
- Immediate local restoration can briefly expose stale display data before backend reconciliation. It cannot grant additional backend privileges because the selected user is not an authorization mechanism.
