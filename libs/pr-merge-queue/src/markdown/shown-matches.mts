import { asciiLowerCase } from 'pr-report-core';
import type { ReadonlyRecord } from 'ts-type-forge';
import { lineAt, proseBlocks } from './prose-blocks.mjs';

/**
 * Each match of `pattern` in the text `markdown` shows (`proseBlocks`), folded
 * by `asciiLowerCase`, block by block, with the lines of `markdown` (from 0) it
 * spans. `pattern` is one `closingKeywordBefore` builds, which matches all.
 *
 * The one reading of a closing keyword that `pr-report` and `pr-description`
 * share, so that what one reads as a keyword the other does too.
 */
export const shownMatches = (
  markdown: string,
  pattern: RegExp,
): readonly ShownMatch[] =>
  proseBlocks(markdown).flatMap((block) =>
    Array.from(asciiLowerCase(block.text).matchAll(pattern), (match) => ({
      groups: { ...match.groups },
      firstLine: lineAt(block, match.index),
      lastLine: lineAt(block, match.index + match[0].length - 1),
    })),
  );

/**
 * For each line of `markdown` (from 0) a match of `pattern` spans, as
 * {@link shownMatches} reads them, the text blocks show on it with every match
 * taken out: what a line that holds a closing keyword says besides.
 */
export const shownOutsideMatches = (
  markdown: string,
  pattern: RegExp,
): ReadonlyMap<number, string> => {
  const blocks = proseBlocks(markdown).map((block) => {
    const folded = asciiLowerCase(block.text);

    return {
      block,
      ranges: Array.from(folded.matchAll(pattern), (match) => ({
        start: match.index,
        end: match.index + match[0].length,
      })),
    } as const;
  });

  const spanned = new Set(
    blocks.flatMap(({ block, ranges }) =>
      ranges.flatMap(({ start, end }) =>
        Array.from(
          { length: lineAt(block, end - 1) - lineAt(block, start) + 1 },
          (_, offset) => lineAt(block, start) + offset,
        ),
      ),
    ),
  );

  const mut_shown = new Map<number, string>(
    Array.from(spanned, (line) => [line, ''] as const),
  );

  for (const { block, ranges } of blocks) {
    let mut_range = 0;

    for (const [i, unit] of block.text.split('').entries()) {
      // A match passed is not looked at again, so that the walk is linear.
      while ((ranges[mut_range]?.end ?? Number.POSITIVE_INFINITY) <= i) {
        mut_range += 1;
      }

      const line = lineAt(block, i);

      const shown = mut_shown.get(line);

      if (
        shown !== undefined &&
        (ranges[mut_range]?.start ?? Number.POSITIVE_INFINITY) > i
      ) {
        mut_shown.set(line, `${shown}${unit}`);
      }
    }
  }

  return mut_shown;
};

/** A match's named groups, and the first and last line it is on. */
export type ShownMatch = Readonly<{
  groups: ReadonlyRecord<string, string | undefined>;
  firstLine: number;
  lastLine: number;
}>;
