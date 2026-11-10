import { Arr } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';

/**
 * `title` cut into at most two lines of `width` units each, a wide character
 * (CJK, full-width) counting two, at a space where one is near and anywhere
 * otherwise, with `…` where it had to stop.
 */
export const fitTitle = (
  title: string,
  width: number,
): readonly [string] | FixedLengthTuple<2, string> => {
  const chars = Array.from(title.trim());

  const first = takeLine(chars, width, false);

  if (Arr.isEmpty(first.rest)) {
    return [first.line];
  }

  const second = takeLine(first.rest, width, true);

  return [first.line, second.line];
};

const unitsOf = (char: string): number => (WIDE.test(char) ? 2 : 1);

const takeLine = (
  chars: readonly string[],
  width: number,
  last: boolean,
): Readonly<{ line: string; rest: readonly string[] }> => {
  let mut_units = 0;

  let mut_end = 0;

  while (mut_end < chars.length) {
    const units = unitsOf(chars[mut_end] ?? '');

    if (mut_units + units > width) {
      break;
    }

    mut_units += units;

    mut_end += 1;
  }

  if (mut_end >= chars.length) {
    return { line: chars.join(''), rest: [] };
  }

  if (last) {
    // Room for the ellipsis.
    const kept = chars.slice(0, Math.max(0, mut_end - 1));

    return { line: `${kept.join('').trimEnd()}…`, rest: [] };
  }

  // Back to a space in the last third of the line, if there is one.
  const space = chars.lastIndexOf(' ', mut_end);

  const cut = space > (mut_end * 2) / 3 ? space : mut_end;

  return {
    line: chars.slice(0, cut).join('').trimEnd(),
    rest: Array.from(chars.slice(cut).join('').trimStart()),
  };
};

/** CJK, kana, Hangul and full-width forms: drawn about twice as wide. */
const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/u;
