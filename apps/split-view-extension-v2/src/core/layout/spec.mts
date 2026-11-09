import { Num, Result } from 'ts-data-forge';
import { nonEmpty } from '../fields.mjs';
import { fixedSplit, maxPaneCount, paneLeaf, split } from './tree.mjs';
import type { FixedSize, LayoutNode, PaneId, SplitAxis } from './types.mjs';

/**
 * A layout as a short string, for the URL (spec L10).
 *
 * Prefix notation: `p` is a pane; `r` (side by side) or `c` (stacked) is a
 * split, followed by the first child's share in percent when it is not 50 — or
 * by whole pixels and `f` / `s` to hold the first / second child at that size —
 * and then its two children. `rcppcpp` is a 2×2 grid, `r737fpp` a 737px column
 * beside the rest. Letters, digits and a dot are what a URL leaves alone, so
 * the address bar shows what was typed.
 */
export const formatLayoutSpec = (node: LayoutNode): string =>
  node.kind === 'pane'
    ? 'p'
    : (`${axisLetter(node.axis)}${node.fixed === undefined ? ratioDigits(node.ratio) : `${node.fixed.px.toString()}${node.fixed.child === 'first' ? 'f' : 's'}`}${formatLayoutSpec(node.first)}${formatLayoutSpec(node.second)}` as const);

/**
 * The tree a spec describes, panes numbered `0..n-1` in tree order, or
 * `undefined` unless the whole string is exactly one tree. Case and whitespace
 * are ignored.
 */
export const parseLayoutSpec = (text: string): LayoutNode | undefined => {
  const source = text.replaceAll(/\s+/gu, '').toLowerCase();

  // Counted first, so that a long spec is refused before the recursion below
  // goes one level deeper for each letter of it.
  if (
    countOf(source, 'p') > maxPaneCount ||
    countOf(source, 'r') + countOf(source, 'c') >= maxPaneCount
  ) {
    return undefined;
  }

  const parsed = parseNode(source, 0, 0);

  return parsed?.end === source.length ? parsed.node : undefined;
};

const countOf = (source: string, letter: string): number =>
  source.split(letter).length - 1;

const axisLetter = (axis: SplitAxis): string => (axis === 'row' ? 'r' : 'c');

/** A tenth of a percent is finer than a divider is dragged. */
const ratioDigits = (ratio: number): string => {
  const percent = Math.round(ratio * 1000) / 10;

  return percent === 50 ? '' : percent.toString();
};

type Parsed = Readonly<{ node: LayoutNode; end: number; nextPaneId: PaneId }>;

// Digits and dots are taken greedily and then judged by `decimalPattern`, so
// that a malformed number fails the whole spec rather than ending it early.
const sizePattern = /^(?<digits>[\d.]*)(?<held>[fs]?)/u;

const decimalPattern = /^\d+$|^\d+\.\d+$/u;

const numberOf = (digits: string): number =>
  Result.unwrapOkOr(Num.safeParseFloat(digits), Number.NaN);

const sizeOf = (
  digits: string | undefined,
  held: string | undefined,
): Readonly<{ ratio: number; fixed: FixedSize | undefined }> | undefined => {
  if (digits !== undefined && !decimalPattern.test(digits)) {
    return undefined;
  }

  if (held !== undefined) {
    // A held size is whole pixels, and has to be written.
    return digits === undefined || digits.includes('.')
      ? undefined
      : {
          ratio: 0.5,
          fixed: {
            child: held === 'f' ? 'first' : 'second',
            px: numberOf(digits),
          },
        };
  }

  return {
    ratio:
      digits === undefined ? 0.5 : Math.round(numberOf(digits) * 10) / 1000,
    fixed: undefined,
  };
};

const parseNode = (
  source: string,
  start: number,
  nextPaneId: PaneId,
): Parsed | undefined => {
  const letter = source[start];

  if (letter === 'p') {
    return {
      node: paneLeaf(nextPaneId),
      end: start + 1,
      nextPaneId: nextPaneId + 1,
    };
  }

  const axis: SplitAxis | undefined =
    letter === 'r' ? 'row' : letter === 'c' ? 'column' : undefined;

  if (axis === undefined) {
    return undefined;
  }

  const size = sizePattern.exec(source.slice(start + 1));

  const digits = nonEmpty(size?.groups?.['digits']);

  const held = nonEmpty(size?.groups?.['held']);

  const sizeLength = size?.[0].length ?? 0;

  const sized = sizeOf(digits, held);

  if (sized === undefined) {
    return undefined;
  }

  const first = parseNode(source, start + 1 + sizeLength, nextPaneId);

  if (first === undefined) {
    return undefined;
  }

  const second = parseNode(source, first.end, first.nextPaneId);

  if (second === undefined) {
    return undefined;
  }

  return {
    node:
      sized.fixed === undefined
        ? split(axis, first.node, second.node, sized.ratio)
        : fixedSplit(axis, first.node, second.node, sized.fixed),
    end: second.end,
    nextPaneId: second.nextPaneId,
  };
};
