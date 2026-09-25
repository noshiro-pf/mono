import { Num, Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { clampRatio, paneNode, splitNode } from './tree.mjs';
import { type LayoutNode, type PaneId, type SplitAxis } from './types.mjs';

/**
 * A layout as a short string, for the page's URL.
 *
 * Prefix notation, one character per node and nothing else: `p` is a pane, and
 * `r` or `c` is a split — side by side or stacked, the `row` / `column` of
 * `SplitAxis` — followed by the first child's share as a percentage, when it is
 * not a half, and then the two children. A 2×2 grid is `rcppcpp`; two columns
 * at 7:3 is `r70pp`; one pane beside two stacked is `rpcpp`.
 *
 * The alphabet is chosen so that the string survives a URL untouched: letters,
 * digits and a dot are the characters nothing percent-encodes, so what is in
 * the address bar is what was typed. Panes carry no id; they are numbered in
 * tree order, which is the order the `url=` parameters are read in.
 */
export const formatLayoutSpec = (node: LayoutNode): string =>
  node.kind === 'pane'
    ? paneLetter
    : (`${axisLetterOf[node.axis]}${ratioDigitsOf(node.ratio)}${formatLayoutSpec(node.first)}${formatLayoutSpec(node.second)}` as const);

/**
 * The tree a spec describes, its panes numbered `0..n-1` in tree order, or
 * `undefined` for a string that is not exactly one tree — too short, too long,
 * or containing anything but the alphabet above. Case and whitespace are
 * ignored, for a spec typed by hand.
 */
export const parseLayoutSpec = (text: string): LayoutNode | undefined => {
  const source = text.replaceAll(/\s+/gu, '').toLowerCase();

  const parsed = parseNode(source, 0, 0);

  return parsed?.index === source.length ? parsed.node : undefined;
};

const paneLetter = 'p';

const axisLetterOf: ReadonlyRecord<SplitAxis, string> = {
  row: 'r',
  column: 'c',
} as const;

const axisOfLetter: ReadonlyMap<string, SplitAxis> = new Map([
  ['r', 'row'],
  ['c', 'column'],
]);

/** A tenth of a percent is finer than a divider can be dragged. */
const ratioDigitsOf = (ratio: number): string => {
  const percent = Math.round(ratio * 1000) / 10;

  return percent === 50 ? '' : String(percent);
};

const ratioCharacters = new Set('0123456789.');

/** The run of digits and dots at `index`, which is where a ratio would be. */
const ratioDigitsAt = (source: string, index: number): string => {
  const end = Array.from(source.slice(index)).findIndex(
    (character) => !ratioCharacters.has(character),
  );

  return source.slice(index, end === -1 ? undefined : index + end);
};

const wholePercent = /^\d+$/u;

const decimalPercent = /^\d+\.\d+$/u;

/**
 * Rounded to the tenth of a percent the digits can express, so that `33.3`
 * comes back as `0.333` and not as the nearest double to `33.3 / 100`.
 * `undefined` for a run of digits that is not a number: `7.`, or `1.2.3`.
 */
const ratioOfDigits = (digits: string): number | undefined =>
  wholePercent.test(digits) || decimalPercent.test(digits)
    ? clampRatio(
        Math.round(
          Result.unwrapOkOr(Num.safeParseFloat(digits), Number.NaN) * 10,
        ) / 1000,
      )
    : undefined;

type Parsed = Readonly<{ node: LayoutNode; index: number; nextPaneId: PaneId }>;

const parseNode = (
  source: string,
  index: number,
  nextPaneId: PaneId,
): Parsed | undefined => {
  const letter = source[index];

  if (letter === paneLetter) {
    return {
      node: paneNode(nextPaneId),
      index: index + 1,
      nextPaneId: nextPaneId + 1,
    };
  }

  const axis = letter === undefined ? undefined : axisOfLetter.get(letter);

  if (axis === undefined) {
    return undefined;
  }

  const digits = ratioDigitsAt(source, index + 1);

  const ratio = digits === '' ? 0.5 : ratioOfDigits(digits);

  if (ratio === undefined) {
    return undefined;
  }

  const first = parseNode(source, index + 1 + digits.length, nextPaneId);

  if (first === undefined) {
    return undefined;
  }

  const second = parseNode(source, first.index, first.nextPaneId);

  if (second === undefined) {
    return undefined;
  }

  return {
    node: splitNode(axis, first.node, second.node, ratio),
    index: second.index,
    nextPaneId: second.nextPaneId,
  };
};
