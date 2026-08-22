#!/usr/bin/env node

import fs from 'node:fs';
import {
  averageLine,
  findUnitsWithUnexpectedSourceCount,
  groupUnitsById,
  parseArgs,
  readXlf,
  rebuildXlf,
  replaceSource,
  summarizeContext,
} from './xlf-utils.mjs';

function printHelp() {
  console.log('Usage: node sync-static-i18n-de.mjs [--en <path>] [--de <path>] [--write]');
}

function summarizeSourceCountIssue(unit) {
  return `${unit.id} (${unit.sourceMatchCount} <source> nodes) | ${summarizeContext(unit)}`;
}

function chooseBestDuplicateCandidate(englishUnit, germanCandidates) {
  const englishSourceFiles = new Set(englishUnit.sourceFiles);
  const englishAverageLine = averageLine(englishUnit);
  let bestCandidate = germanCandidates[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const candidate of germanCandidates) {
    const sharedFiles = candidate.sourceFiles.filter((sourceFile) => englishSourceFiles.has(sourceFile))
      .length;
    const candidateAverageLine = averageLine(candidate);
    const lineDistance =
      englishAverageLine === null || candidateAverageLine === null
        ? 9999
        : Math.abs(englishAverageLine - candidateAverageLine);
    const score = sharedFiles * 100 - Math.min(lineDistance, 99);

    if (score > bestScore) {
      bestCandidate = candidate;
      bestScore = score;
    }
  }

  return bestCandidate;
}

function findReuseCandidates(englishUnit, staleGermanUnits) {
  const englishSourceFiles = new Set(englishUnit.sourceFiles);
  const englishAverageLine = averageLine(englishUnit);

  return staleGermanUnits
    .map((candidate) => {
      const sharedFiles = candidate.sourceFiles.filter((sourceFile) => englishSourceFiles.has(sourceFile))
        .length;
      const candidateAverageLine = averageLine(candidate);
      const lineDistance =
        englishAverageLine === null || candidateAverageLine === null
          ? 9999
          : Math.abs(englishAverageLine - candidateAverageLine);

      return {
        id: candidate.id,
        sourceInner: candidate.sourceInner,
        context: summarizeContext(candidate),
        score: sharedFiles * 100 - Math.min(lineDistance, 99),
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const english = readXlf(options.en);
  const german = readXlf(options.de);
  const malformedEnglishUnits = findUnitsWithUnexpectedSourceCount(english.units);
  const malformedGermanUnits = findUnitsWithUnexpectedSourceCount(german.units);
  const germanById = groupUnitsById(german.units);
  const englishIdSet = new Set(english.units.map((unit) => unit.id));
  const staleGermanUnits = german.units.filter((unit) => !englishIdSet.has(unit.id));
  const duplicateGermanIds = [...germanById.entries()]
    .filter(([, groupedUnits]) => groupedUnits.length > 1)
    .map(([id, groupedUnits]) => ({ id, units: groupedUnits }));
  const duplicateReview = [];
  const translationQueue = [];

  if (malformedEnglishUnits.length > 0) {
    console.log('English source catalog is malformed.');
    console.log('Review these units before syncing:');

    for (const unit of malformedEnglishUnits) {
      console.log(`- ${summarizeSourceCountIssue(unit)}`);
    }

    process.exitCode = 1;
    return;
  }

  const rebuiltBlocks = english.units.map((englishUnit) => {
    const germanMatches = germanById.get(englishUnit.id) ?? [];

    if (germanMatches.length === 1) {
      return replaceSource(englishUnit.block, germanMatches[0].sourceInner);
    }

    if (germanMatches.length > 1) {
      const chosenCandidate = chooseBestDuplicateCandidate(englishUnit, germanMatches);

      duplicateReview.push({
        id: englishUnit.id,
        context: summarizeContext(englishUnit),
        chosenContext: summarizeContext(chosenCandidate),
        choiceCount: germanMatches.length,
      });

      return replaceSource(englishUnit.block, chosenCandidate.sourceInner);
    }

    translationQueue.push({
      id: englishUnit.id,
      englishSource: englishUnit.sourceInner,
      context: summarizeContext(englishUnit),
      reuseCandidates: findReuseCandidates(englishUnit, staleGermanUnits),
    });

    return replaceSource(englishUnit.block, englishUnit.sourceInner);
  });

  if (options.write) {
    const nextGermanContent = rebuildXlf(english, rebuiltBlocks);
    fs.writeFileSync(options.de, nextGermanContent, 'utf8');
  }

  console.log(`English units: ${english.units.length}`);
  console.log(`German units before sync: ${german.units.length}`);
  console.log(`German units with malformed <source> nodes before sync: ${malformedGermanUnits.length}`);
  console.log(`Stale German units removed by sync: ${staleGermanUnits.length}`);
  console.log(`Duplicate German IDs detected: ${duplicateGermanIds.length}`);
  console.log(`Units needing translation after sync: ${translationQueue.length}`);

  if (malformedGermanUnits.length > 0) {
    console.log('\nMalformed German units detected before sync:');

    for (const unit of malformedGermanUnits) {
      console.log(`- ${summarizeSourceCountIssue(unit)}`);
    }
  }

  if (duplicateReview.length > 0) {
    console.log('\nDuplicate IDs requiring review:');

    for (const item of duplicateReview) {
      console.log(
        `- ${item.id} | English context: ${item.context} | Chosen German context: ${item.chosenContext} | Matches: ${item.choiceCount}`,
      );
    }
  }

  if (translationQueue.length > 0) {
    console.log('\nUnits needing translation or reuse review:');

    for (const item of translationQueue) {
      console.log(`- ${item.id}`);
      console.log(`  Context: ${item.context}`);
      console.log(`  English: ${item.englishSource}`);

      if (item.reuseCandidates.length === 0) {
        console.log('  Reuse candidates: none');
        continue;
      }

      console.log('  Reuse candidates:');

      for (const candidate of item.reuseCandidates) {
        console.log(`    - ${candidate.id} | ${candidate.context} | ${candidate.sourceInner}`);
      }
    }
  }

  if (!options.write) {
    console.log('\nDry run only. Re-run with --write to update the German XLF.');
  }

  if (duplicateReview.length > 0 || translationQueue.length > 0) {
    console.log('\nReview required before the German catalog can be considered synced.');
    process.exitCode = 1;
  }
}

main();
