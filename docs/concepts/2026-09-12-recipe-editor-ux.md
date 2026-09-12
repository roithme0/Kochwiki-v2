# Recipe Editor Experience

## Status

Draft. The sectioned editor, dialog container, compact always-visible section navigation, preparation-step reordering, and visible non-pinned nutrition chart are agreed directions. Visual refinements have been evaluated with mockups; remaining behavior details are open.

## Context

Kochwiki is mobile-first. Creating a recipe, editing an active version, and editing a draft share one editor inside a dialog. The editor currently uses three unlabeled Material stepper panels for metadata, ingredients, and preparation, followed by a single save area. Recipe editing is iterative: changing servings, ingredients, and instructions may require revisiting earlier fields.

## Problem

The stepper groups fields and limits visible content, but conceals related sections during revision. A disabled save action gives little guidance when an invalid field is in another panel. In preparation, users must type a numeric index for every step, including newly added steps, even though its position in the list already expresses the intended order.

## Proposed Direction

Replace the stepper with one sectioned editor while preserving the existing groups: Basics, Ingredients, and Preparation. Keep the editor inside the existing create/edit dialog. Provide a compact, sticky section navigation area so a user can jump to a group without traversing the whole form. Its active state follows the section in view as the user scrolls. Separate the form sections with whitespace rather than divider lines; retain a divider above the save area.

Keep the navigation visible even while the on-screen keyboard is open. Make its compact footprint a layout constraint rather than depending on dynamic keyboard detection; automatic show/hide is deferred.

Keep the save action easy to find as content grows. When saving is blocked, identify the affected section and show the relevant field error. Preserve the distinct actions for editing an active recipe and an existing draft.

In Preparation, show steps in their effective order with a drag handle on each step and no visible index or ordinal. A drag moves the whole step, including its description, and the list updates immediately. Adding a step places it at the end without asking for an index. Removing or moving a step leaves a contiguous order. Provide an equivalent accessible move action for keyboard and assistive-technology users; dragging alone cannot be the only reorder mechanism. Keep the handle separate from the text area so text selection and page scrolling remain usable on touch screens.

## Visual Assessment and Directions to Explore

The Basics section is an acceptable starting point. The Preparation section is simple, but replacing the index field with a drag handle creates an opportunity to give the description more width and clarify the row hierarchy. The destructive remove control should remain distinct from reordering.

The Ingredients section needs the most visual work, but the inline foodstuff select and amount field are readable and should remain separate inputs in one row. Do not merge their outlines into one compound control. Put each ingredient's remove action at the right edge, matching Preparation. Nutrition feedback is central to recipe editing, so keep the chart visible rather than hiding it behind a disclosure. The chart belongs in the section's normal scroll flow; users can scroll to it after changing quantities. Do not pin it while editing, because it would compete with the keyboard and ingredient controls for limited screen space. Keep Create foodstuff visually quiet.

Place the nutrition legend beside the chart and show it whenever chart data is available. Remove the Details toggle. Preserve the current legend's visual treatment and content rather than adopting the redesigned legend from the mockup. Check that both chart and legend remain legible at narrow phone widths; their side-by-side placement must not force horizontal scrolling.

Keep the original filled button type for Add ingredient and Add step, but limit each button's width and align both to the left. The full-width Save action remains the strongest call to action. Do not adopt the outlined add buttons from the later mockup.

Use narrower, left-aligned Servings and Preparation time fields, as the revised mockup made their short values look more balanced. Do not display preparation-step numbers.

## Scope Boundaries

This concept concerns the shared create/edit editor and preparation-step ordering. It does not change recipe version lifecycle, publication semantics, foodstuff management, or the nutrition calculation. Dynamic keyboard-based navigation hiding is deferred. Image generation is reserved for final visual verification after the interaction direction is settled.

## Integration Impact

The frontend currently loads and displays steps ordered by `index`, and the write contract requires a unique numeric index from 1 to 99 for each step. The editor can derive these indexes from the visible list order when submitting, avoiding a backend contract change for reordering. The existing maximum of 99 steps still applies unless separately revisited. The current versioning design requires complete, valid recipes even when saving an existing draft; this concept does not assume partial or automatic saving.

## Open Questions

- What compact presentation of the sticky section navigation works best at phone width?
- How should the dialog header and save actions share limited mobile space, especially when the keyboard is open?
- What exact width lets the filled add buttons read as secondary to Save without awkward text wrapping?
- Where should the chart sit relative to the ingredient list, and how much space should it occupy on a phone?
- How should the existing legend adapt beside the chart on the narrowest supported phone width?
- Should the source fields remain visible by default or be disclosed within Basics?
- What move control is clearest beside drag handles on a narrow screen: up/down buttons or a step actions menu?
- Should ingredients also gain drag ordering, given that their API entries use numeric indexes?

## Risks

Persistent navigation and save controls can consume too much mobile viewport space, especially with the keyboard open. Dragging within a scrolling form can conflict with page scroll. A sectioned form can still feel long if secondary fields and previews dominate the screen; the section layout needs validation with realistic recipe content. A chart in the normal scroll flow must remain legible without taking so much height that moving between ingredient edits and nutrition feedback becomes tedious.
