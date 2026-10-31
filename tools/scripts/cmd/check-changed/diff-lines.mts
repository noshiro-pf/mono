import { Num, Result } from 'ts-data-forge';

/**
 * The added and changed lines of a `git diff -U0 --no-renames` output, by the
 * path the line has after the change (the `+++ b/…` side).
 *
 * `-U0` leaves no context lines, so each hunk header says exactly which lines
 * of the new file the diff wrote: `@@ -12,3 +12,5 @@` is lines 12 to 16, and a
 * count of `0` is a deletion that wrote nothing. A deleted file (`+++
 * /dev/null`) and a binary file (no hunk) contribute no lines.
 *
 * Git quotes a path holding a double quote, a backslash or a control character
 * even under `core.quotePath=false`; such a path is skipped rather than guessed
 * at, since nothing in this repository is named that way.
 */
export const parseAddedLines = (
  diff: string,
): ReadonlyMap<string, readonly number[]> => {
  const mut_result = new Map<string, readonly number[]>();

  // `inHeader` is the stretch between `diff --git` and the first hunk, the only
  // place a `+++ ` line is a header rather than an added line whose text begins
  // `++ `.
  const mut_current: { file: string | undefined; inHeader: boolean } = {
    file: undefined,
    inHeader: false,
  };

  for (const line of diff.split('\n')) {
    if (line.startsWith('diff --git ')) {
      mut_current.file = undefined;

      mut_current.inHeader = true;

      continue;
    }

    if (mut_current.inHeader && line.startsWith('+++ ')) {
      // Git ends the header with a tab when the path holds a space.
      const target = line.slice('+++ '.length).replace(TRAILING_TAB, '');

      mut_current.file = target.startsWith('b/')
        ? target.slice('b/'.length)
        : undefined;

      continue;
    }

    const { file } = mut_current;

    const hunk = HUNK_HEADER.exec(line);

    if (hunk !== null) {
      mut_current.inHeader = false;
    }

    if (file === undefined || hunk === null) {
      continue;
    }

    const start = toInt(hunk[1]);

    // `+12` with no count is one line; `+12,0` is none.
    const count = hunk[2] === '' ? 1 : toInt(hunk[2]);

    if (count <= 0 || start <= 0) {
      continue;
    }

    mut_result.set(file, [
      ...(mut_result.get(file) ?? []),
      ...Array.from({ length: count }, (_, i) => start + i),
    ]);
  }

  return mut_result;
};

/**
 * Collapses line numbers into ranges for a report: `[3, 4, 5, 9]` reads
 * `3-5, 9`. Past `maxRanges` the rest is counted rather than listed, so that a
 * file no test reaches at all does not fill the screen.
 */
export const formatLineRanges = (
  lines: readonly number[],
  maxRanges: number = Number.POSITIVE_INFINITY,
): string => {
  const present: ReadonlySet<number> = new Set<number>(lines);

  const sorted = Array.from(present).toSorted((a, b) => a - b);

  // In sorted order the n-th line with no predecessor and the n-th line with no
  // successor are the two ends of the n-th range.
  const ends = sorted.filter((line) => !present.has(line + 1));

  const ranges = sorted
    .filter((line) => !present.has(line - 1))
    .map((from, i) => {
      const to = ends[i] ?? from;

      return from === to ? from.toString() : `${from}-${to}`;
    });

  const shown = ranges.slice(0, maxRanges);

  return ranges.length > shown.length
    ? `${shown.join(', ')} … (${ranges.length - shown.length} more ranges)`
    : shown.join(', ');
};

const TRAILING_TAB = /\t$/u;

/** A capture of `\d+`, or `NaN` for anything else. */
const toInt = (digits: string | undefined): number =>
  Result.unwrapOkOr(Num.safeParseInt(digits ?? ''), Number.NaN);

/**
 * `@@ -<old> +<start>[,<count>] @@`; the old side is not read, and an absent
 * count captures as `''`.
 */
const HUNK_HEADER = /^@@ -\S+ \+(\d+),?(\d*) @@/u;
