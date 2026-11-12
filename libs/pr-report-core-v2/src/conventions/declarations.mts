/**
 * The declarations written in bodies (`spec/conventions.md`, "Declarations in
 * bodies"): `Merge-After:` in a pull request, `Start-After:` in an issue, and
 * the fenced code blocks inside which nothing is read.
 */

import { Arr, Num, Result } from 'ts-data-forge';
import { isMergesBeforeNote } from './description-lines.mjs';

/**
 * The numbers a body's `Merge-After:` lines name, as a set in first-appearance
 * order.
 */
export const parseMergeAfter = (body: string): readonly number[] =>
  parseDeclaration(body, 'merge-after');

/** The numbers a body's `Start-After:` lines name, read as `Merge-After:` is. */
export const parseStartAfter = (body: string): readonly number[] =>
  parseDeclaration(body, 'start-after');

/**
 * The numbers the `Merges before` line of `body` names (`isMergesBeforeNote`),
 * its first outside a fenced code block; none when there is none. Prose, not a
 * declaration: `open-pr` reads it to keep it, not to order anything.
 */
export const parseMergesBefore = (body: string): readonly number[] =>
  Arr.uniq(
    numbersIn(
      outsideCodeFences(body).split('\n').find(isMergesBeforeNote) ?? '',
    ),
  );

/** Whether `line` is read as a declaration of `key`, whatever it names. */
export const isDeclarationLine = (line: string, key: DeclarationKey): boolean =>
  declarationLine(key).test(line);

/**
 * `body` with every line inside a fenced code block, the fence lines included,
 * blanked; the line count is kept. A fence is how a document says "a sample,
 * not the thing itself", so an example declaration in one declares nothing.
 *
 * A fence opens on three or more backticks or tildes after any indentation (a
 * backtick fence whose info string holds a backtick is inline code), and closes
 * on a run of the same character at least as long with nothing after it.
 */
export const outsideCodeFences = (body: string): string => {
  const lines = body.split('\n');

  const roles = codeLineRoles(lines);

  return lines
    .map((line, i) => (roles[i] === undefined ? line : ''))
    .join('\n');
};

/**
 * The fenced code blocks of `body`, each from its opening line through its
 * closing one (or the end of the body, for one left open), as written: the
 * lines {@link outsideCodeFences} blanks, cut where it cuts them.
 */
export const codeFenceBlocks = (body: string): readonly string[] => {
  const lines = body.split('\n');

  const roles = codeLineRoles(lines);

  return Arr.generate(function* () {
    for (const [start, role] of roles.entries()) {
      if (role !== 'open') {
        continue;
      }

      // A block runs from its opening line up to the first that is no code.
      const end = roles.findIndex((r, i) => i > start && r !== 'code');

      yield lines.slice(start, end === -1 ? lines.length : end).join('\n');
    }
  });
};

export type DeclarationKey = 'merge-after' | 'start-after';

const MERGE_AFTER_LINE = /^[^\S\n]*merge-after[^\S\n]*:(?<refs>[^\n]*)$/iu;

const START_AFTER_LINE = /^[^\S\n]*start-after[^\S\n]*:(?<refs>[^\n]*)$/iu;

const NUMBER_REF = /(?<![\w./-])#(?<number>\d+)\b/gu;

const FENCE_LINE = /^[^\S\n]*(?<marker>`{3,}|~{3,})(?<rest>[^\n]*)$/u;

/**
 * Every `#N` of a declaration line, unless right after a character that could
 * end a repository name (`other/repo#5`) or followed by a word character
 * (`#12abc`).
 */
const numbersIn = (refs: string): readonly number[] =>
  Arr.generate(function* () {
    for (const parsed of Array.from(refs.matchAll(NUMBER_REF), (match) =>
      Num.safeParseInt(match.groups?.['number'] ?? ''),
    )) {
      if (Result.isOk(parsed)) {
        yield parsed.value;
      }
    }
  });

const declarationLine = (key: DeclarationKey): RegExp =>
  key === 'merge-after' ? MERGE_AFTER_LINE : START_AFTER_LINE;

const parseDeclaration = (
  body: string,
  key: DeclarationKey,
): readonly number[] =>
  Arr.uniq(
    outsideCodeFences(body)
      .split('\n')
      .flatMap((line) => {
        const refs = declarationLine(key).exec(line)?.groups?.['refs'];

        return refs === undefined ? [] : numbersIn(refs);
      }),
  );

/**
 * What each of `lines` is: the line opening a fence (`open`), one inside it or
 * closing it (`code`), or neither (`undefined`).
 */
const codeLineRoles = (
  lines: readonly string[],
): readonly ('code' | 'open' | undefined)[] => {
  let mut_openedBy: string | undefined = undefined;

  return lines.map((line) => {
    const groups = FENCE_LINE.exec(line)?.groups;

    const marker = groups?.['marker'];

    const rest = groups?.['rest'] ?? '';

    if (mut_openedBy === undefined) {
      // A backtick fence's info string holds no backtick (CommonMark), so such
      // a line is inline code, not an opening.
      if (
        marker === undefined ||
        (marker.startsWith('`') && rest.includes('`'))
      ) {
        return undefined;
      }

      mut_openedBy = marker;

      return 'open';
    }

    // Only a run of the opening character, at least as long, with nothing after
    // it, closes the fence; any other fence line is code.
    if (
      marker !== undefined &&
      marker[0] === mut_openedBy[0] &&
      marker.length >= mut_openedBy.length &&
      rest.trim() === ''
    ) {
      mut_openedBy = undefined;
    }

    return 'code';
  });
};
