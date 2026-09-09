#!/usr/bin/env node

import {
  compareStringArrays,
  extractIcuHeaders,
  extractPlaceholderTags,
  findDuplicateIds,
  findUnitsWithUnexpectedSourceCount,
  isAllowedUntranslatedSource,
  looksTranslatable,
  normalizeBlockWithoutSource,
  normalizeSourceInnerForComparison,
  parseArgs,
  readXlf,
} from './xlf-utils.mjs';

function printHelp() {
  console.log('Usage: node check-static-i18n-de.mjs [--en <path>] [--de <path>]');
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const english = readXlf(options.en);
  const german = readXlf(options.de);
  const failures = [];
  const warnings = [];
  const malformedEnglishUnits = findUnitsWithUnexpectedSourceCount(english.units);
  const malformedGermanUnits = findUnitsWithUnexpectedSourceCount(german.units);

  if (malformedEnglishUnits.length > 0) {
    failures.push(
      `English file has invalid <source> node counts for IDs: ${malformedEnglishUnits
        .map((unit) => `${unit.id}(${unit.sourceMatchCount})`)
        .join(', ')}`,
    );
  }

  if (malformedGermanUnits.length > 0) {
    failures.push(
      `German file has invalid <source> node counts for IDs: ${malformedGermanUnits
        .map((unit) => `${unit.id}(${unit.sourceMatchCount})`)
        .join(', ')}`,
    );
  }

  const englishDuplicates = findDuplicateIds(english.units);
  const germanDuplicates = findDuplicateIds(german.units);

  if (englishDuplicates.length > 0) {
    failures.push(
      `English file has duplicate IDs: ${englishDuplicates.map((item) => item.id).join(', ')}`,
    );
  }

  if (germanDuplicates.length > 0) {
    failures.push(
      `German file has duplicate IDs: ${germanDuplicates.map((item) => item.id).join(', ')}`,
    );
  }

  if (english.units.length !== german.units.length) {
    failures.push(
      `Unit count mismatch: English ${english.units.length}, German ${german.units.length}`,
    );
  }

  const comparableLength = Math.min(english.units.length, german.units.length);

  for (let index = 0; index < comparableLength; index += 1) {
    const englishUnit = english.units[index];
    const germanUnit = german.units[index];

    if (englishUnit.id !== germanUnit.id) {
      failures.push(
        `Unit order mismatch at index ${index}: English ${englishUnit.id}, German ${germanUnit.id}`,
      );
      continue;
    }

    if (normalizeBlockWithoutSource(englishUnit.block) !== normalizeBlockWithoutSource(germanUnit.block)) {
      failures.push(`Context or metadata mismatch for ID ${englishUnit.id}`);
    }

    const englishTags = extractPlaceholderTags(englishUnit.sourceInner);
    const germanTags = extractPlaceholderTags(germanUnit.sourceInner);

    if (!compareStringArrays(englishTags, germanTags)) {
      failures.push(`Placeholder tag mismatch for ID ${englishUnit.id}`);
    }

    const englishIcuHeaders = extractIcuHeaders(englishUnit.sourceInner);
    const germanIcuHeaders = extractIcuHeaders(germanUnit.sourceInner);

    if (!compareStringArrays(englishIcuHeaders, germanIcuHeaders)) {
      failures.push(`ICU header mismatch for ID ${englishUnit.id}`);
    }

    if (
      normalizeSourceInnerForComparison(englishUnit.sourceInner) ===
        normalizeSourceInnerForComparison(germanUnit.sourceInner) &&
      looksTranslatable(englishUnit.sourceInner) &&
      !isAllowedUntranslatedSource(englishUnit.sourceInner)
    ) {
      warnings.push(`German source still matches English for ID ${englishUnit.id}`);
    }
  }

  if (failures.length > 0) {
    console.log('QC failed.');

    for (const failure of failures) {
      console.log(`- ${failure}`);
    }

    if (warnings.length > 0) {
      console.log('\nWarnings:');

      for (const warning of warnings) {
        console.log(`- ${warning}`);
      }
    }

    process.exitCode = 1;
    return;
  }

  console.log('QC passed.');

  if (warnings.length > 0) {
    console.log('\nWarnings:');

    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }
}

main();
