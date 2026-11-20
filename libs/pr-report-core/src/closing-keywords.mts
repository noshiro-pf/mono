/**
 * GitHub's closing keywords, as text is read for them where its rendering is not
 * at hand: `pr-report` reading which issues a pull request closes, and
 * `pr-description` refusing a keyword anywhere but at the end of a description.
 * One grammar for both, so that a line one reads as a keyword the other does
 * too.
 */

/**
 * A closing keyword, then `reference`, as a pattern over text already folded by
 * `asciiLowerCase`. `reference` is a pattern source and may hold named groups.
 * Global (`gu`), for `matchAll`; `test` and `exec` would carry `lastIndex` from
 * one text to the next.
 *
 * Between them go spaces, a colon or both, or nothing before a `#`. No `i`
 * flag: under `iu`, the letters would also take U+017F LATIN SMALL LETTER
 * LONG S and U+212A KELVIN SIGN, which Unicode folds to `s` and `k`, and `\w`
 * and `\b` would widen with them.
 *
 * Not confirmed against GitHub's rendering, and so left on the side of reading a
 * keyword, since a keyword missed costs more than one read wrongly: a keyword
 * with nothing between it and the reference (`fixes#12`); a keyword after a
 * letter outside ASCII, or a number before one (`#12を`), since `\w` and `\b`
 * are ASCII; and a space outside ASCII, such as U+3000 IDEOGRAPHIC SPACE, which
 * `\s` takes for a separator.
 */
export const closingKeywordBefore = (reference: string): RegExp =>
  // One source for the keyword list and the separator, which each caller puts
  // before a reference of its own; `reference` is a caller's literal, never
  // input.
  // eslint-disable-next-line security/detect-non-literal-regexp
  new RegExp(
    String.raw`(?:\b${KEYWORD}${SEPARATOR}|${NOT_IN_A_NAME}${KEYWORD}(?=#))(?:${reference})`,
    'gu',
  );

/**
 * An issue's number as a reference spells it, for `reference` in
 * {@link closingKeywordBefore}: digits, not all of them zero, since no issue is
 * numbered 0. Not followed by a letter or a digit.
 */
export const CLOSING_ISSUE_NUMBER = String.raw`(?!0+\b)\d+\b`;

/** `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves`, `resolved`. */
const KEYWORD = '(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)';

// Not a line break: a caller passes text with a `\n` only where one block or
// table cell ends and the next begins, a line break within a paragraph, soft or
// hard, already a space (`pr-merge-queue`'s `proseBlocks`), so that a keyword
// is read within a paragraph but not from one block into the next.
const SEPARATOR = String.raw`(?:[^\S\n]*:[^\S\n]*|[^\S\n]+)`;

// With nothing between a keyword and its `#`, not after a letter, a digit, or
// what joins a repository's name, a path or a query, so that `owner/fix#12`,
// `/how-to-fix#3` or `?q=fix#3` is no keyword. With a separator, `\b` alone, so
// that `auto-closes #12` is read.
const NOT_IN_A_NAME = String.raw`(?<![\w./&?=+%:#-])`;
