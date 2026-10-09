/**
 * Cutting a title to fit a node of the DAG, where SVG text does not wrap or
 * clip by itself. Widths are estimated in units of a narrow character: a CJK
 * character or an emoji is two. Close enough for a label, and it needs no
 * font measurement, so it can be done before anything is drawn.
 */

/** The estimated width of `text`, in narrow-character units. */
export const textWidthUnits = (text: string): number =>
  Array.from(text).reduce((sum, char) => sum + charUnits(char), 0);

/**
 * `text`, or as much of it as fits in `maxUnits` with `…` after it. Cuts
 * between code points, never inside a surrogate pair.
 */
export const truncateToUnits = (text: string, maxUnits: number): string => {
  if (textWidthUnits(text) <= maxUnits) {
    return text;
  }

  const mut_kept: string[] = [];

  let mut_units = ELLIPSIS_UNITS;

  for (const char of text) {
    const units = charUnits(char);

    if (mut_units + units > maxUnits) {
      break;
    }

    mut_kept.push(char);

    mut_units += units;
  }

  return `${mut_kept.join('')}…`;
};

const ELLIPSIS_UNITS = 1;

/** Half-width katakana (U+FF61–U+FF9F) is narrow; the rest of these is wide. */
const charUnits = (char: string): number => {
  const codePoint = char.codePointAt(0) ?? 0;

  return 0xff_61 <= codePoint && codePoint <= 0xff_9f
    ? 1
    : 0x11_00 <= codePoint
      ? 2
      : 1;
};
