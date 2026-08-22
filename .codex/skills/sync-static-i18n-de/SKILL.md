---
name: sync-static-i18n-de
description: Sync Angular static-content i18n from `messages.xlf` into `messages.de.xlf` for this repo, run `extract-i18n`, preserve existing German translations for unchanged units, reuse prior German text when changed IDs are still clearly equivalent, translate new or changed units into German, copy English context metadata, remove stale or duplicate units, and run final QC on structure and placeholders.
---

# Sync Static i18n DE

Use this skill when the user asks to update German static translations for Angular localize in this repo.

## Scope

- `src/locales/static-content/messages.xlf`
- `src/locales/static-content/messages.de.xlf`

This skill only covers static-content localization handled by Angular localize. It does not update dynamic translations managed through `ngx-translate`.

## Repo-Specific Rules

- Run `npm run extract-i18n` before syncing files.
- Treat `messages.xlf` as the source of truth for `trans-unit` IDs, order, datatype, and context metadata.
- This repo stores German translations inside the `<source>` element of `messages.de.xlf`. Do not add `<target>` nodes.
- `messages.de.xlf` must end with the same `trans-unit` set and order as `messages.xlf`.

## Workflow

1. Run `npm run extract-i18n`.
2. Run `node .codex/skills/sync-static-i18n-de/scripts/sync-static-i18n-de.mjs --write`.
   - Treat a non-zero exit as expected if duplicate-ID review or translation review is still required.
3. Review the sync report:
   - Translate every unit that fell back to English because the ID is new or changed.
   - For changed IDs, reuse the previous German wording when the old and new source are clearly equivalent in meaning, placeholders, and tone.
   - If equivalence is not clear, retranslate from the current English source.
4. Keep English context groups mirrored into the German file.
5. Run `node .codex/skills/sync-static-i18n-de/scripts/check-static-i18n-de.mjs`.
6. Summarize:
   - which units were translated or reused
   - any units that remain uncertain and need human review
   - any structural issues found and fixed

## Translation Rules

- Preserve placeholders, XML tags, entities, ICU/select/plural syntax, and significant whitespace exactly.
- Keep product names and code-like tokens unchanged unless the source already localizes them.
- Prefer concise, natural German that matches the source meaning and UI tone.
- If a translation is uncertain, write the best-effort German translation into the file and flag that unit in the final report for human review.

## Quality Control

The final result must satisfy all of these checks:

- `messages.xlf` and `messages.de.xlf` have identical `trans-unit` IDs in identical order.
- No duplicate IDs remain.
- No extra or missing units remain.
- Every `trans-unit` contains exactly one `<source>` node.
- Context metadata in German matches English for every unit.
- Placeholder tags and ICU headers still match the English source.
- Newly touched units are not accidentally left in English unless that is intentionally correct.
- A QC pass means the files are structurally valid; translation quality still needs human review for touched units.

## Helper Scripts

- `scripts/sync-static-i18n-de.mjs`
  - Syncs German structure to English.
  - Reuses translations for unchanged IDs.
  - Reports malformed units, duplicate IDs, removed stale IDs, and units that still need translation.
  - Exits non-zero when manual review is still required.
- `scripts/check-static-i18n-de.mjs`
  - Verifies ID parity, order, source-node validity, context parity, duplicate IDs, placeholder parity, and suspicious untranslated units.
