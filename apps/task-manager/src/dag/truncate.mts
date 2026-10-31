/**
 * Cutting a title to fit a node of the DAG, where SVG text does not wrap or
 * clip by itself. Widths are estimated in units of a narrow character: a CJK
 * character or an emoji is two. Close enough for a label, and it needs no font
 * measurement, so it can be done before anything is drawn. Text is cut between
 * the characters a reader sees (grapheme clusters), never inside an emoji
 * sequence or before a combining mark.
 */

import { hasKey, isRecord } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';

/** The estimated width of `text`, in narrow-character units. */
export const textWidthUnits = (text: string): number =>
  graphemes(text).reduce((sum, char) => sum + charUnits(char), 0);

/** `text`, or as much of it as fits in `maxUnits` with `…` after it. */
export const truncateToUnits = (text: string, maxUnits: number): string =>
  truncateChars(graphemes(text), maxUnits);

/**
 * `text`, its spaces at either end dropped and each run of them one space, as
 * SVG draws it, broken into at most `maxLines` lines of `maxUnits` each — the
 * first `firstLineUnits`, for what goes before it. A line is broken between any
 * two characters, as Japanese is, except inside a word of narrow characters,
 * beside a no-break space, before a closing bracket or punctuation and after an
 * opening one (`mayBreakAt`), at the last place that fits; a space at the break
 * is dropped. A word longer than a line is broken where the line is full,
 * rather than moved to the next, and so is a line with no place to break it.
 * What does not fit on the last line is cut there as `truncateToUnits` cuts it.
 */
export const wrapToUnits = (
  text: string,
  maxUnits: number,
  maxLines: number,
  firstLineUnits: number = maxUnits,
): readonly string[] => {
  const mut_lines: string[] = [];

  // As SVG draws it: a run of white space as one space.
  let mut_rest: readonly string[] = graphemes(
    text.trim().replaceAll(/[^\S\u{A0}\u{202F}]+/gu, ' '),
  );

  const unitsOf = (line: number): number =>
    line === 0 ? firstLineUnits : maxUnits;

  while (mut_lines.length < maxLines - 1) {
    const end = lineEnd(mut_rest, unitsOf(mut_lines.length), 1);

    if (end === mut_rest.length) {
      break;
    }

    const breakAt = lastBreak(mut_rest, end, maxUnits);

    mut_lines.push(mut_rest.slice(0, breakAt).join('').trimEnd());

    mut_rest = withoutLeadingSpaces(mut_rest.slice(breakAt));
  }

  mut_lines.push(truncateChars(mut_rest, unitsOf(mut_lines.length)));

  return mut_lines;
};

const ELLIPSIS_UNITS = 1;

/**
 * What a cluster of more than one code point is made with: a mark or another
 * extender (a variation selector, a half-width sound mark, a tag), an emoji
 * modifier, a flag's half or a joiner. Text with none of them is one code point
 * a character, and is split without the slower segmenter.
 */
const CLUSTERED =
  /[\p{M}\p{Grapheme_Extend}\p{Emoji_Modifier}\p{Regional_Indicator}\u{200D}\u{0E33}\u{0EB3}]/u;

/** Drawn as an emoji, whatever its first code point (a keycap). */
const EMOJI_CLUSTER = /[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]/u;

/** Never at the start of a line: closing brackets and punctuation. */
const CLOSING = new Set(
  Array.from('、。，．・：；？！々）」』】〕〉》］｝〙〗〟’”｡､｣),.:;!?]}'),
);

/** Never at the end of a line: opening brackets. */
const OPENING = new Set(Array.from('（「『【〔〈《［｛〘〖〝‘“｢([{'));

const NO_BREAK_SPACES = new Set<string>(['\u{A0}', '\u{202F}']);

/** Inside a word: an apostrophe, a no-break space or hyphen. */
const WORD_JOINERS = new Set<string>(['’', '\u{A0}', '\u{202F}', '\u{2011}']);

/**
 * Drawn wide, two units: East Asian wide and full-width characters —
 * Hangul, CJK, kana, full-width forms — and, to err on the side of cutting too
 * soon, punctuation (but `…`), symbols and emoji that Japanese fonts may draw
 * wide.
 */
const WIDE_RANGES: readonly FixedLengthTuple<2, number>[] = [
  [0x11_00, 0x11_5f],
  [0x20_10, 0x20_25],
  [0x20_27, 0x20_6f],
  [0x21_00, 0x2b_ff],
  [0x2e_80, 0x30_3e],
  [0x30_41, 0x33_ff],
  [0x34_00, 0x4d_bf],
  [0x4e_00, 0x9f_ff],
  [0xa0_00, 0xa4_cf],
  [0xa9_60, 0xa9_7f],
  [0xac_00, 0xd7_a3],
  [0xf9_00, 0xfa_ff],
  [0xfe_10, 0xfe_19],
  [0xfe_30, 0xfe_6f],
  [0xff_00, 0xff_60],
  [0xff_e0, 0xff_e6],
  [0x1_f0_00, 0x1_fa_ff],
  [0x1_6f_e0, 0x1_b2_ff],
  [0x2_00_00, 0x3_ff_fd],
] as const;

/** Where there is none, as in an older browser, code points stand in. */
const segmenter =
  isRecord(Intl) && hasKey(Intl, 'Segmenter')
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : undefined;

const graphemes = (text: string): readonly string[] =>
  segmenter !== undefined && CLUSTERED.test(text)
    ? Array.from(segmenter.segment(text), ({ segment }) => segment)
    : Array.from(text);

/** Half-width katakana and its punctuation, U+FF61–U+FF9F. */
const isHalfWidthKana = (char: string): boolean => {
  const codePoint = char.codePointAt(0) ?? 0;

  return 0xff_61 <= codePoint && codePoint <= 0xff_9f;
};

/**
 * Half-width katakana is narrow, each of its sound marks one more; what is
 * in {@link WIDE_RANGES} is wide, and so is an emoji sequence, whatever it
 * starts with; the rest is narrow.
 */
const charUnits = (char: string): number => {
  const codePoint = char.codePointAt(0) ?? 0;

  return isHalfWidthKana(char)
    ? char.length
    : WIDE_RANGES.some(([from, to]) => from <= codePoint && codePoint <= to) ||
        (char.length > 1 && EMOJI_CLUSTER.test(char))
      ? 2
      : 1;
};

/** White space a line may be broken at: not a no-break space. */
const isSpace = (char: string | undefined): boolean =>
  char?.trim() === '' && !NO_BREAK_SPACES.has(char);

/**
 * A character of a word that is not broken: narrow, and not a space or
 * half-width katakana, which is broken as Japanese is — or what holds a
 * word together, as the apostrophe of `don’t`.
 */
const isWordChar = (char: string | undefined): boolean =>
  char !== undefined &&
  !isSpace(char) &&
  (WORD_JOINERS.has(char) || (charUnits(char) === 1 && !isHalfWidthKana(char)));

/**
 * How many of `chars`, from the first, fit in `maxUnits`; at least `atLeast`.
 */
const lineEnd = (
  chars: readonly string[],
  maxUnits: number,
  atLeast: number,
): number => {
  let mut_units = 0;

  for (const [index, char] of chars.entries()) {
    mut_units += charUnits(char);

    if (mut_units > maxUnits) {
      return Math.max(index, atLeast);
    }
  }

  return chars.length;
};

/** `chars`, or as many as fit in `maxUnits` with `…` after them. */
const truncateChars = (chars: readonly string[], maxUnits: number): string =>
  lineEnd(chars, maxUnits, 0) === chars.length
    ? chars.join('')
    : (`${chars
        .slice(0, lineEnd(chars, maxUnits - ELLIPSIS_UNITS, 0))
        .join('')
        .trimEnd()}…` as const);

/**
 * Whether a break before `chars[index]` puts no closing character at the start
 * of a line and no opening one at the end — spaces between them, which the
 * break drops, aside.
 */
const keepsBrackets = (chars: readonly string[], index: number): boolean => {
  let mut_after = index;

  while (isSpace(chars[mut_after])) {
    mut_after += 1;
  }

  let mut_before = index - 1;

  while (isSpace(chars[mut_before])) {
    mut_before -= 1;
  }

  return (
    !CLOSING.has(chars[mut_after] ?? '') &&
    !OPENING.has(chars[mut_before] ?? '')
  );
};

/**
 * Whether a line may be broken before `chars[index]`: not inside a word, not
 * beside a no-break space, and not where `keepsBrackets` says no.
 */
const mayBreakAt = (chars: readonly string[], index: number): boolean =>
  !(isWordChar(chars[index - 1]) && isWordChar(chars[index])) &&
  !NO_BREAK_SPACES.has(chars[index - 1] ?? '') &&
  !NO_BREAK_SPACES.has(chars[index] ?? '') &&
  keepsBrackets(chars, index);

/**
 * Where to break `chars`, of which those before `end` fit on a line `maxUnits`
 * wide: at the last place it may be broken, unless what that puts on the next
 * line could not fit on a line either — a word longer than a line — or there is
 * no such place after the first character; then where the line is full, but
 * before a closing character that would start the next.
 */
const lastBreak = (
  chars: readonly string[],
  end: number,
  maxUnits: number,
): number => {
  let mut_forced = end;

  while (mut_forced > 1 && !keepsBrackets(chars, mut_forced)) {
    mut_forced -= 1;
  }

  let mut_allowed = end;

  while (mut_allowed > 0 && !mayBreakAt(chars, mut_allowed)) {
    mut_allowed -= 1;
  }

  if (mut_allowed === 0) {
    return mut_forced;
  }

  // What the break at `mut_allowed` would put on the next line, up to its next
  // place to break, looked at no further than a line can hold.
  let mut_next = mut_allowed;

  let mut_units = 0;

  do {
    mut_units += charUnits(chars[mut_next] ?? '');

    mut_next += 1;
  } while (
    mut_units <= maxUnits &&
    mut_next < chars.length &&
    (mut_next <= end || !mayBreakAt(chars, mut_next))
  );

  return mut_units > maxUnits ? mut_forced : mut_allowed;
};

const withoutLeadingSpaces = (chars: readonly string[]): readonly string[] => {
  const first = chars.findIndex((char) => !isSpace(char));

  return first === -1 ? [] : chars.slice(first);
};
