/**
 * Fitting a title into a node of the issue DAG, where SVG text neither
 * wraps nor clips by itself. Widths are estimated in units of a narrow
 * character, a CJK character or an emoji being two — close enough for a
 * label, and it needs no font measurement, so it is done before anything is
 * drawn. The same estimate as the task manager's DAG
 * (`apps/task-manager-app/src/dag/truncate.mts`).
 */

/**
 * `title` in at most `maxLines` lines of at most `unitsPerLine`, the last
 * one cut with `…` if the title does not fit. A line is broken after a space
 * when one is in its later part, so that a word stays whole; otherwise
 * between any two characters, which is how Japanese breaks anyway.
 */
import { Arr } from 'ts-data-forge';

export const wrapTitle = (
  title: string,
  unitsPerLine: number,
  maxLines: number,
): readonly string[] => {
  const mut_lines: string[] = [];

  let mut_rest: readonly string[] = Array.from(title.trim());

  while (Arr.isNonEmpty(mut_rest) && mut_lines.length < maxLines) {
    const last = mut_lines.length === maxLines - 1;

    const fits = takeUnits(mut_rest, unitsPerLine);

    if (fits === mut_rest.length) {
      mut_lines.push(mut_rest.join(''));

      break;
    }

    if (last) {
      const kept = takeUnits(mut_rest, unitsPerLine - ELLIPSIS_UNITS);

      mut_lines.push(`${mut_rest.slice(0, kept).join('').trimEnd()}…`);

      break;
    }

    const space = mut_rest.slice(0, fits + 1).lastIndexOf(' ');

    const breakAt = space >= fits * WORD_BREAK_FROM ? space : fits;

    mut_lines.push(mut_rest.slice(0, breakAt).join('').trimEnd());

    const next = mut_rest.slice(breakAt);

    const start = next.findIndex((character) => character !== ' ');

    mut_rest = start === -1 ? [] : next.slice(start);
  }

  return mut_lines;
};

/** How far into a line a space has to be for the line to break there. */
const WORD_BREAK_FROM = 0.6;

const ELLIPSIS_UNITS = 1;

/** How many of `chars`, from the start, fit in `maxUnits`. */
const takeUnits = (chars: readonly string[], maxUnits: number): number => {
  let mut_units = 0;

  for (const [index, char] of chars.entries()) {
    mut_units += charUnits(char);

    if (mut_units > maxUnits) {
      return index;
    }
  }

  return chars.length;
};

/** Half-width katakana (U+FF61–U+FF9F) is narrow; the rest of these is wide. */
const charUnits = (char: string): number => {
  const codePoint = char.codePointAt(0) ?? 0;

  return 0xff_61 <= codePoint && codePoint <= 0xff_9f
    ? 1
    : 0x11_00 <= codePoint
      ? 2
      : 1;
};
