/**
 * Shared parser for `export type` and `export namespace` declarations.
 *
 * Walks the source character-by-character so it tolerates `declare global`
 * blocks, quoted strings, nested braces, and generic-parameter lists. Used
 * by both `gen-global` (which emits an ambient mirror of every public type)
 * and `get-type-definitions` (which builds the README's type listing with
 * line links).
 */

export type TypeExport = Readonly<{
  name: string;
  generic: string;
  argList: string;
  line: number;
}>;

export type NamespaceExport = Readonly<{
  name: string;
  line: number;
  types: readonly TypeExport[];
}>;

export type FileExports = Readonly<{
  types: readonly TypeExport[];
  namespaces: readonly NamespaceExport[];
}>;

/** Extracts every top-level `export type` / `export namespace` declaration. */
export const extractTypeExports = (content: string): FileExports => {
  // Replace block and line comments with spaces to preserve offsets while
  // keeping newlines so the line counter below stays accurate. Line comments
  // may contain apostrophes (e.g. "shouldn't") that the string-skip logic
  // below would otherwise misread as a string opener.
  const cleaned = content
    .replaceAll(/\/\*[\s\S]*?\*\//gu, blankNonNewlines)
    .replaceAll(/\/\/[^\n]*/gu, blankNonNewlines);

  const lineOf = (idx: number): number =>
    countOccurrences(cleaned.slice(0, idx), '\n') + 1;

  const mut_types: TypeExport[] = [];

  const mut_namespaces: NamespaceExport[] = [];

  let mut_i = 0;

  const len = cleaned.length;

  while (mut_i < len) {
    const newI = skipDeclareGlobal(cleaned, mut_i);

    if (newI > 0) {
      mut_i = newI;

      continue;
    }

    if (
      cleaned[mut_i] === "'" ||
      cleaned[mut_i] === '"' ||
      cleaned[mut_i] === '`'
    ) {
      mut_i = skipQuoted(cleaned, mut_i);

      continue;
    }

    if (cleaned[mut_i] === '{') {
      // Top-level object/type literals shouldn't appear, but skip them safely.
      mut_i = skipBraceBlock(cleaned, mut_i);

      continue;
    }

    if (!isWordBoundary(cleaned, mut_i)) {
      mut_i += 1;

      continue;
    }

    const slice = cleaned.slice(mut_i);

    const typeMatch = /^export\s+type\s+(\w+)/u.exec(slice);

    if (typeMatch !== null) {
      const parsed = parseTypeHeader(cleaned, mut_i, typeMatch[0].length);

      mut_types.push({
        name: typeMatch[1] ?? '',
        generic: parsed.generic,
        argList: parsed.argList,
        line: lineOf(mut_i),
      });

      mut_i = parsed.nextIdx;

      continue;
    }

    const nsMatch = /^export\s+namespace\s+(\w+)/u.exec(slice);

    if (nsMatch !== null) {
      const nsName = nsMatch[1] ?? '';

      const nsLine = lineOf(mut_i);

      let mut_j = mut_i + nsMatch[0].length;

      while (mut_j < len && cleaned[mut_j] !== '{') mut_j += 1;

      if (mut_j >= len) {
        mut_i = len;

        continue;
      }

      const bodyStart = mut_j + 1;

      const bodyEnd = findMatchingBrace(cleaned, mut_j);

      if (bodyEnd < 0) {
        mut_i = len;

        continue;
      }

      mut_namespaces.push({
        name: nsName,
        line: nsLine,
        types: extractNamespaceTypes(cleaned, bodyStart, bodyEnd - 1, lineOf),
      });

      mut_i = bodyEnd;

      continue;
    }

    mut_i += 1;
  }

  return { types: mut_types, namespaces: mut_namespaces };
};

const extractNamespaceTypes = (
  cleaned: string,
  start: number,
  end: number,
  lineOf: (idx: number) => number,
): readonly TypeExport[] => {
  const mut_types: TypeExport[] = [];

  let mut_i = start;

  while (mut_i < end) {
    if (
      cleaned[mut_i] === "'" ||
      cleaned[mut_i] === '"' ||
      cleaned[mut_i] === '`'
    ) {
      mut_i = skipQuoted(cleaned, mut_i);

      continue;
    }

    if (cleaned[mut_i] === '{') {
      mut_i = skipBraceBlock(cleaned, mut_i);

      continue;
    }

    if (!isWordBoundary(cleaned, mut_i)) {
      mut_i += 1;

      continue;
    }

    const slice = cleaned.slice(mut_i, end);

    const typeMatch = /^export\s+type\s+(\w+)/u.exec(slice);

    if (typeMatch !== null) {
      const parsed = parseTypeHeader(cleaned, mut_i, typeMatch[0].length);

      mut_types.push({
        name: typeMatch[1] ?? '',
        generic: parsed.generic,
        argList: parsed.argList,
        line: lineOf(mut_i),
      });

      mut_i = parsed.nextIdx;

      continue;
    }

    mut_i += 1;
  }

  return mut_types;
};

const blankNonNewlines = (m: string): string => m.replaceAll(/[^\n]/gu, ' ');

const isWordBoundary = (content: string, i: number): boolean =>
  i === 0 || /\W/u.test(content[i - 1] ?? ' ');

const skipQuoted = (content: string, startIdx: number): number => {
  const quote = content[startIdx];

  let mut_i = startIdx + 1;

  const len = content.length;

  while (mut_i < len && content[mut_i] !== quote) {
    mut_i += content[mut_i] === '\\' ? 2 : 1;
  }

  return mut_i + 1;
};

const skipBraceBlock = (content: string, startIdx: number): number => {
  const endIdx = findMatchingBrace(content, startIdx);

  return endIdx < 0 ? content.length : endIdx;
};

const findMatchingBrace = (content: string, startIdx: number): number => {
  let mut_depth = 0;

  let mut_i = startIdx;

  const len = content.length;

  while (mut_i < len) {
    const ch = content[mut_i];

    if (ch === "'" || ch === '"' || ch === '`') {
      mut_i = skipQuoted(content, mut_i);

      continue;
    }

    if (ch === '{') mut_depth += 1;

    if (ch === '}') {
      mut_depth -= 1;

      if (mut_depth === 0) return mut_i + 1;
    }

    mut_i += 1;
  }

  return -1;
};

const parseTypeHeader = (
  content: string,
  startIdx: number,
  prefixLen: number,
): Readonly<{ generic: string; argList: string; nextIdx: number }> => {
  const len = content.length;

  let mut_j = startIdx + prefixLen;

  while (mut_j < len && /\s/u.test(content[mut_j] ?? '')) mut_j += 1;

  let mut_generic = '';

  let mut_argList = '';

  if (content[mut_j] === '<') {
    const endIdx = findMatchingGt(content, mut_j);

    if (endIdx > 0) {
      mut_generic = content.slice(mut_j, endIdx);

      mut_argList = `<${extractParamNames(mut_generic).join(', ')}>`;

      mut_j = endIdx;
    }
  }

  return { generic: mut_generic, argList: mut_argList, nextIdx: mut_j };
};

const skipDeclareGlobal = (content: string, startIdx: number): number => {
  let mut_i = startIdx;

  while (mut_i < content.length && /\s/u.test(content[mut_i] ?? '')) mut_i += 1;

  if (content.slice(mut_i, mut_i + 14) !== 'declare global') return -1;

  while (mut_i < content.length && content[mut_i] !== '{') mut_i += 1;

  if (mut_i >= content.length) return -1;

  let mut_depth = 0;

  while (mut_i < content.length) {
    if (content[mut_i] === '{') mut_depth += 1;

    if (content[mut_i] === '}') {
      mut_depth -= 1;

      if (mut_depth === 0) return mut_i + 1;
    }

    mut_i += 1;
  }

  return -1;
};

const findMatchingGt = (content: string, startIdx: number): number => {
  let mut_depth = 0;

  let mut_i = startIdx;

  const len = content.length;

  while (mut_i < len) {
    const ch = content[mut_i];

    // Skip arrow functions `=>`
    if (ch === '=' && content[mut_i + 1] === '>') {
      mut_i += 2;

      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;

      mut_i += 1;

      while (mut_i < len && content[mut_i] !== quote) {
        mut_i += content[mut_i] === '\\' ? 2 : 1;
      }

      mut_i += 1;

      continue;
    }

    switch (ch) {
      case '<': {
        mut_depth += 1;

        break;
      }
      case '>': {
        mut_depth -= 1;

        if (mut_depth === 0) return mut_i + 1;

        break;
      }

      case undefined:
        break;

      default:
        break;
    }

    mut_i += 1;
  }

  return -1;
};

const extractParamNames = (generic: string): readonly string[] => {
  const inner = generic.trim().replace(/^</u, '').replace(/>$/u, '');

  const mut_params: string[] = [];

  let mut_curr = '';

  let mut_bal = 0;

  for (const ch of inner) {
    if (ch === '<' || ch === '(' || ch === '[' || ch === '{') mut_bal += 1;

    if (ch === '>' || ch === ')' || ch === ']' || ch === '}') mut_bal -= 1;

    if (ch === ',' && mut_bal === 0) {
      mut_params.push(mut_curr.trim());

      mut_curr = '';
    } else {
      mut_curr += ch;
    }
  }

  if (mut_curr.trim() !== '') mut_params.push(mut_curr.trim());

  return mut_params.map((p) => (p.split(/[\s=]/u)[0] ?? '').trim());
};

const countOccurrences = (haystack: string, needle: string): number => {
  let mut_count = 0;

  let mut_idx = haystack.indexOf(needle);

  while (mut_idx !== -1) {
    mut_count += 1;

    mut_idx = haystack.indexOf(needle, mut_idx + needle.length);
  }

  return mut_count;
};
