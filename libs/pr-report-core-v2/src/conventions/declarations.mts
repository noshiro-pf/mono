/**
 * The declarations written in bodies (`spec/conventions.md`, "Declarations in
 * bodies"): `Merge-After:` in a pull request, `Start-After:` in an issue, and
 * the fenced code blocks inside which nothing is read.
 */

import { Arr, Num, Result } from 'ts-data-forge';

/**
 * The numbers a body's `Merge-After:` lines name, as a set in first-appearance
 * order.
 */
export const parseMergeAfter = (body: string): readonly number[] =>
  parseDeclaration(body, 'merge-after');

/** The numbers a body's `Start-After:` lines name, read as `Merge-After:` is. */
export const parseStartAfter = (body: string): readonly number[] =>
  parseDeclaration(body, 'start-after');

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
  let mut_openedBy: string | undefined = undefined;

  return body
    .split('\n')
    .map((line) => {
      const groups = FENCE_LINE.exec(line)?.groups;

      const marker = groups?.['marker'];

      const rest = groups?.['rest'] ?? '';

      if (mut_openedBy === undefined) {
        if (
          marker === undefined ||
          (marker.startsWith('`') && rest.includes('`'))
        ) {
          return line;
        }

        mut_openedBy = marker;

        return '';
      }

      if (
        marker !== undefined &&
        marker[0] === mut_openedBy[0] &&
        marker.length >= mut_openedBy.length &&
        rest.trim() === ''
      ) {
        mut_openedBy = undefined;
      }

      return '';
    })
    .join('\n');
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
