/**
 * What a label chip looks like, worked out from the colour GitHub holds.
 *
 * The chip is the label's own colour with black or white on it, which is what
 * makes a GitHub label what it is at a glance and what a reader of this
 * page already reads without thinking. The only decision is which of the two inks,
 * and that is computed rather than guessed: `#ededed` and `#0e8a16` are both
 * label colours this repository uses, and the same ink on both is unreadable
 * on one of them.
 */

import {
  asNonZeroFiniteNumber,
  Num,
  type NonZeroFiniteNumber,
} from 'ts-data-forge';
import { type FixedLengthTuple } from 'ts-type-forge';

export type ChipColors = Readonly<{
  background: string;
  text: string;
  /**
   * A hairline of the ink at low alpha rather than a colour of its own, so
   * that a chip whose colour is close to the surface still has an edge.
   */
  border: string;
}>;

/**
 * The three colours for one label.
 *
 * `color` is what the GitHub API sends: six hex digits with no `#`. Anything
 * else — an empty string from a payload written before colours were carried,
 * or a value GitHub has never sent — falls back to the grey GitHub gives a
 * new label, because a chip that is the wrong colour is better than a page
 * that is not there.
 */
export const chipColors = (color: string): ChipColors => {
  const rgb = parseHex(color) ?? parseHex(FALLBACK) ?? BLACK;

  const luminance = relativeLuminance(rgb);

  // Whichever of the two inks contrasts more. Between them they clear 4.5:1
  // on every colour but the mid-greys, where the better one still clears 4.4.
  const onWhite = contrastRatio(luminance, WHITE_LUMINANCE);

  const onBlack = contrastRatio(luminance, BLACK_LUMINANCE);

  const light = onWhite >= onBlack;

  return {
    background: `#${rgb.map(toHexPair).join('')}`,
    text: light ? '#ffffff' : '#000000',
    border: light ? 'rgb(255 255 255 / 25%)' : 'rgb(0 0 0 / 20%)',
  };
};

/** GitHub's own default for a label nobody has chosen a colour for. */
const FALLBACK = 'ededed';

type Rgb = FixedLengthTuple<3, number>;

const BLACK: Rgb = [0, 0, 0];

const MAX_CHANNEL: NonZeroFiniteNumber = asNonZeroFiniteNumber(255);

/** The two constants of the sRGB transfer function, as divisors. */
const SRGB_LINEAR_SLOPE: NonZeroFiniteNumber = asNonZeroFiniteNumber(12.92);

const SRGB_OFFSET_SCALE: NonZeroFiniteNumber = asNonZeroFiniteNumber(1.055);

const WHITE_LUMINANCE = 1;

const BLACK_LUMINANCE = 0;

const parseHex = (color: string): Rgb | undefined => {
  const digits = color.startsWith('#') ? color.slice(1) : color;

  if (!/^[0-9a-f]{6}$/iu.test(digits)) return undefined;

  const pair = (at: number): number =>
    Number.parseInt(digits.slice(at, at + 2), 16);

  return [pair(0), pair(2), pair(4)];
};

const toHexPair = (channel: number): string =>
  channel.toString(16).padStart(2, '0');

/** WCAG 2.x relative luminance, which is what the contrast ratio is of. */
const relativeLuminance = ([r, g, b]: Rgb): number =>
  0.2126 * channelLuminance(r) +
  0.7152 * channelLuminance(g) +
  0.0722 * channelLuminance(b);

const channelLuminance = (channel: number): number => {
  const c = Num.div(channel, MAX_CHANNEL);

  return c <= 0.040_45
    ? Num.div(c, SRGB_LINEAR_SLOPE)
    : Num.div(c + 0.055, SRGB_OFFSET_SCALE) ** 2.4;
};

const contrastRatio = (a: number, b: number): number => {
  const darker = Math.min(a, b) + 0.05;

  return Num.isNonZero(darker)
    ? Num.div(Math.max(a, b) + 0.05, darker)
    : Number.POSITIVE_INFINITY;
};
