import fs from 'node:fs';

export const DEFAULT_EN_PATH = 'src/locales/static-content/messages.xlf';
export const DEFAULT_DE_PATH = 'src/locales/static-content/messages.de.xlf';

const BODY_PATTERN = /(<body>\s*)([\s\S]*?)(\s*<\/body>)/;
const TRANS_UNIT_PATTERN = /<trans-unit\b[\s\S]*?<\/trans-unit>/g;
const ID_PATTERN = /<trans-unit\b[^>]*\bid="([^"]+)"/;
const SOURCE_PATTERN = /<source>([\s\S]*?)<\/source>/;
const SOURCE_BLOCK_PATTERN = /<source>([\s\S]*?)<\/source>/g;
const CONTEXT_GROUP_PATTERN = /<context-group\b[\s\S]*?<\/context-group>/g;
const SOURCEFILE_PATTERN = /<context context-type="sourcefile">([\s\S]*?)<\/context>/g;
const LINENUMBER_PATTERN = /<context context-type="linenumber">([\d,\s]+)<\/context>/g;
const ICU_HEADER_PATTERN = /\{([A-Z0-9_]+)\s*,\s*(select|plural)\s*,/g;
const ALLOWED_UNTRANSLATED_SOURCES = new Set([
  'Name',
  'Labels',
  'WBT',
  'Text',
  'Editor',
  'Chat',
  'Chatbot',
  'Interview',
  'Interviews',
  'Details',
  'Trends',
  'Videos',
  'Test',
  'WBT-Editor',
  '{VAR_SELECT, select, true {Tests} false {Trainings}}',
]);

export function parseArgs(argv) {
  const options = {
    en: DEFAULT_EN_PATH,
    de: DEFAULT_DE_PATH,
    write: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === '--write') {
      options.write = true;
      continue;
    }

    if (current === '--en') {
      options.en = requireValue(argv, index, current);
      index += 1;
      continue;
    }

    if (current === '--de') {
      options.de = requireValue(argv, index, current);
      index += 1;
      continue;
    }

    if (current === '--help') {
      options.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${current}`);
  }

  return options;
}

function requireValue(argv, index, flag) {
  const nextValue = argv[index + 1];

  if (!nextValue) {
    throw new Error(`Missing value for ${flag}`);
  }

  return nextValue;
}

export function readXlf(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const bodyMatch = content.match(BODY_PATTERN);

  if (!bodyMatch || bodyMatch.index === undefined) {
    throw new Error(`Could not locate <body> in ${filePath}`);
  }

  const [fullMatch, bodyPrefix, bodyContent, bodySuffix] = bodyMatch;
  const prefix = content.slice(0, bodyMatch.index) + bodyPrefix;
  const suffix = bodySuffix + content.slice(bodyMatch.index + fullMatch.length);
  const blocks = bodyContent.match(TRANS_UNIT_PATTERN) ?? [];
  const units = blocks.map(parseUnit);

  return {
    filePath,
    prefix,
    suffix,
    units,
  };
}

export function parseUnit(block) {
  const id = matchRequired(block, ID_PATTERN, 'trans-unit id');
  const sourceMatches = [...block.matchAll(SOURCE_BLOCK_PATTERN)];

  if (sourceMatches.length === 0) {
    throw new Error(`Could not extract source content for trans-unit ${id}`);
  }

  const sourceInner = sourceMatches[0][1];
  const contextGroups = [...block.matchAll(CONTEXT_GROUP_PATTERN)].map((match) => match[0]);
  const sourceFiles = [...block.matchAll(SOURCEFILE_PATTERN)].map((match) => match[1].trim());
  const lineNumbers = [...block.matchAll(LINENUMBER_PATTERN)].flatMap((match) =>
    match[1]
      .split(',')
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isFinite(value)),
  );

  return {
    block,
    id,
    sourceInner,
    sourceMatchCount: sourceMatches.length,
    contextGroups,
    sourceFiles,
    lineNumbers,
  };
}

function matchRequired(text, pattern, label) {
  const match = text.match(pattern);

  if (!match) {
    throw new Error(`Could not extract ${label}`);
  }

  return match[1];
}

export function groupUnitsById(units) {
  const byId = new Map();

  for (const unit of units) {
    const existing = byId.get(unit.id) ?? [];
    existing.push(unit);
    byId.set(unit.id, existing);
  }

  return byId;
}

export function findDuplicateIds(units) {
  return [...groupUnitsById(units).entries()]
    .filter(([, groupedUnits]) => groupedUnits.length > 1)
    .map(([id, groupedUnits]) => ({ id, units: groupedUnits }));
}

export function replaceSource(block, nextSourceInner) {
  if (!SOURCE_PATTERN.test(block)) {
    throw new Error('Could not replace <source> contents');
  }

  return block.replace(SOURCE_PATTERN, `<source>${nextSourceInner}</source>`);
}

export function rebuildXlf(template, nextBlocks) {
  const transUnitIndentMatch = template.prefix.match(/\n([ \t]*)$/);
  const transUnitIndent = transUnitIndentMatch?.[1] ?? '';

  return `${template.prefix}${nextBlocks.join(`\n${transUnitIndent}`)}${template.suffix}`;
}

export function normalizeBlockWithoutSource(block) {
  return block.replace(SOURCE_BLOCK_PATTERN, '<source></source>').replace(/\r\n/g, '\n');
}

export function extractPlaceholderTags(sourceInner) {
  return sourceInner.match(/<[^>]+>/g) ?? [];
}

export function extractIcuHeaders(sourceInner) {
  return [...sourceInner.matchAll(ICU_HEADER_PATTERN)].map(
    (match) => `${match[1]}:${match[2]}`,
  );
}

export function compareStringArrays(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

export function normalizeSourceInnerForComparison(sourceInner) {
  return sourceInner.trim().replace(/\r\n/g, '\n');
}

export function summarizeContext(unit) {
  return unit.sourceFiles
    .map((sourceFile, index) => {
      const lineNumber = unit.lineNumbers[index];
      return lineNumber ? `${sourceFile}:${lineNumber}` : sourceFile;
    })
    .join(', ');
}

export function looksTranslatable(sourceInner) {
  const withoutTags = sourceInner.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ');
  return /[A-Za-z]/.test(withoutTags);
}

export function averageLine(unit) {
  if (unit.lineNumbers.length === 0) {
    return null;
  }

  const total = unit.lineNumbers.reduce((sum, value) => sum + value, 0);
  return total / unit.lineNumbers.length;
}

export function findUnitsWithUnexpectedSourceCount(units) {
  return units.filter((unit) => unit.sourceMatchCount !== 1);
}

export function isAllowedUntranslatedSource(sourceInner) {
  return ALLOWED_UNTRANSLATED_SOURCES.has(normalizeSourceInnerForComparison(sourceInner));
}
