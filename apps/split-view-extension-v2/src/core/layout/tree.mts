import { Arr, Num } from 'ts-data-forge';
import type {
  FixedSize,
  LayoutNode,
  NodePath,
  PaneId,
  Side,
  SplitAxis,
  SplitNode,
} from './types.mjs';

export const paneLeaf = (paneId: PaneId): LayoutNode =>
  ({ kind: 'pane', paneId }) as const;

export const split = (
  axis: SplitAxis,
  first: LayoutNode,
  second: LayoutNode,
  ratio: number = 0.5,
): LayoutNode =>
  ({ kind: 'split', axis, ratio: clampRatio(ratio), first, second }) as const;

/** A split whose `fixed.child` keeps its size and whose other child takes the rest. */
export const fixedSplit = (
  axis: SplitAxis,
  first: LayoutNode,
  second: LayoutNode,
  fixed: FixedSize,
): LayoutNode =>
  ({
    kind: 'split',
    axis,
    ratio: 0.5,
    fixed: { child: fixed.child, px: clampFixedPx(fixed.px) },
    first,
    second,
  }) as const;

/**
 * The panes in tree order: `first` before `second` at every split, which for
 * the grids the presets build is down each column, then rightwards. It is the
 * order the URL lists addresses in and the order a preset reuses panes in.
 */
export const paneIdsOf = (node: LayoutNode): readonly PaneId[] =>
  node.kind === 'pane'
    ? ([node.paneId] as const)
    : ([...paneIdsOf(node.first), ...paneIdsOf(node.second)] as const);

/**
 * Replaces the leaf `target` with a split of itself and `paneId` on `side`:
 * splitting a pane inserts a new one to its right or below it, and moving a
 * pane inserts an existing one on any side.
 */
export const insertBeside = (
  node: LayoutNode,
  target: PaneId,
  side: Side,
  paneId: PaneId,
): LayoutNode => {
  if (node.kind === 'pane') {
    if (node.paneId !== target) {
      return node;
    }

    const axis = axisOfSide(side);

    return side === 'left' || side === 'top'
      ? split(axis, paneLeaf(paneId), node)
      : split(axis, node, paneLeaf(paneId));
  }

  return {
    ...node,
    first: insertBeside(node.first, target, side, paneId),
    second: insertBeside(node.second, target, side, paneId),
  };
};

/**
 * Removes a leaf, its sibling taking the space the split had. `undefined` when
 * the leaf was the whole tree: the last pane is not removed.
 */
export const removePane = (
  node: LayoutNode,
  paneId: PaneId,
): LayoutNode | undefined => {
  if (node.kind === 'pane') {
    return node.paneId === paneId ? undefined : node;
  }

  const first = removePane(node.first, paneId);

  const second = removePane(node.second, paneId);

  return first === undefined
    ? second
    : second === undefined
      ? first
      : first === node.first && second === node.second
        ? node
        : { ...node, first, second };
};

/**
 * Exchanges two panes' places. The tree changes and the panes do not, so
 * nothing reloads. A pane the tree does not have leaves it as it is.
 */
export const swapPanes = (
  node: LayoutNode,
  a: PaneId,
  b: PaneId,
): LayoutNode => {
  const present = paneIdsOf(node);

  if (a === b || !present.includes(a) || !present.includes(b)) {
    return node;
  }

  const swapped = (current: LayoutNode): LayoutNode =>
    current.kind === 'pane'
      ? current.paneId === a
        ? paneLeaf(b)
        : current.paneId === b
          ? paneLeaf(a)
          : current
      : ({
          ...current,
          first: swapped(current.first),
          second: swapped(current.second),
        } as const);

  return swapped(node);
};

/** Takes `moved` out and attaches it to `side` of `target`. */
export const movePaneBeside = (
  node: LayoutNode,
  moved: PaneId,
  target: PaneId,
  side: Side,
): LayoutNode => {
  const present = paneIdsOf(node);

  if (
    moved === target ||
    !present.includes(moved) ||
    !present.includes(target)
  ) {
    return node;
  }

  const without = removePane(node, moved);

  // Never `undefined` while both panes are in the tree, which was checked.
  return without === undefined
    ? node
    : insertBeside(without, target, side, moved);
};

/** The split node at `path`, or `undefined` when there is none. */
export const splitAt = (
  node: LayoutNode,
  path: NodePath,
): SplitNode | undefined => {
  if (node.kind === 'pane') {
    return undefined;
  }

  if (!Arr.isNonEmpty(path)) {
    return node;
  }

  const [head, ...rest] = path;

  return splitAt(head === 'first' ? node.first : node.second, rest);
};

/**
 * Moves the divider of the split at `path` so that its first child is `firstPx`
 * of `availablePx`: the held child's size for a fixed split, the ratio
 * otherwise. The same tree when nothing changes.
 */
export const resizeAt = (
  node: LayoutNode,
  path: NodePath,
  firstPx: number,
  availablePx: number,
): LayoutNode =>
  updateSplitAt(node, path, (target) => {
    if (target.fixed !== undefined) {
      const px = clampFixedPx(
        target.fixed.child === 'first' ? firstPx : availablePx - firstPx,
      );

      return px === target.fixed.px
        ? target
        : { ...target, fixed: { ...target.fixed, px } };
    }

    if (!Num.isNonZero(availablePx)) {
      return target;
    }

    const ratio = clampRatio(Num.div(firstPx, availablePx));

    return ratio === target.ratio ? target : { ...target, ratio };
  });

/**
 * Keeps a divider off the edges of its node, so that each pane keeps room for
 * the toolbar it is dragged and closed by.
 */
export const clampRatio = (ratio: number): number =>
  Number.isFinite(ratio) ? Math.min(maxRatio, Math.max(minRatio, ratio)) : 0.5;

/** A whole number of pixels from zero to `maxFixedPx`. */
export const clampFixedPx = (px: number): number =>
  Number.isFinite(px) ? Math.min(maxFixedPx, Math.max(0, Math.round(px))) : 0;

/** `nodes` split evenly along `axis`: three on `row` are three equal columns. */
export const evenChain = (
  axis: SplitAxis,
  nodes: readonly LayoutNode[],
): LayoutNode => {
  if (!Arr.isNonEmpty(nodes)) {
    throw new Error('evenChain: at least one node is required');
  }

  const [head, ...rest] = nodes;

  const count = nodes.length;

  return Arr.isNonEmpty(rest) && Num.isNonZero(count)
    ? split(axis, head, evenChain(axis, rest), Num.div(1, count))
    : head;
};

export const axisOfSide = (side: Side): SplitAxis =>
  side === 'left' || side === 'right' ? 'row' : 'column';

export const minRatio = 0.05;

export const maxRatio = 0.95;

/**
 * The most panes a split view has: more than a screen shows usefully, and a
 * bound on what a URL or a backup can ask for, each pane being a live page.
 */
export const maxPaneCount = 64;

/**
 * Wider than any screen; a bound so that a hand-written spec cannot hold a
 * child at a number `toString` writes in exponent notation.
 */
const maxFixedPx = 100_000;

const updateSplitAt = (
  node: LayoutNode,
  path: NodePath,
  update: (target: SplitNode) => SplitNode,
): LayoutNode => {
  if (node.kind === 'pane') {
    return node;
  }

  if (!Arr.isNonEmpty(path)) {
    return update(node);
  }

  const [head, ...rest] = path;

  if (head === 'first') {
    const first = updateSplitAt(node.first, rest, update);

    return first === node.first ? node : { ...node, first };
  }

  const second = updateSplitAt(node.second, rest, update);

  return second === node.second ? node : { ...node, second };
};
