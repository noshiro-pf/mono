import { Arr, Num } from 'ts-data-forge';
import {
  type LayoutNode,
  type NodePath,
  type PaneDropSide,
  type PaneId,
  type SplitAxis,
} from './types.mjs';

export const paneNode = (paneId: PaneId): LayoutNode =>
  ({
    kind: 'pane',
    paneId,
  }) as const;

export const splitNode = (
  axis: SplitAxis,
  first: LayoutNode,
  second: LayoutNode,
  ratio: number = 0.5,
): LayoutNode => ({ kind: 'split', axis, ratio, first, second }) as const;

/**
 * The panes the tree refers to, in tree order: at every split, `first` — the
 * left or upper child — before `second`. For the grids the presets build, that
 * is down each column and then rightwards.
 */
export const paneIdsOf = (node: LayoutNode): readonly PaneId[] =>
  node.kind === 'pane'
    ? ([node.paneId] as const)
    : ([...paneIdsOf(node.first), ...paneIdsOf(node.second)] as const);

/**
 * Replaces the leaf for `targetPaneId` with a split of itself and a new pane.
 * The existing pane keeps the `first` half, so a rightward split puts the new
 * pane on the right and a downward split puts it below.
 */
export const splitPaneAt = (
  node: LayoutNode,
  targetPaneId: PaneId,
  axis: SplitAxis,
  newPaneId: PaneId,
): LayoutNode =>
  insertPaneBeside(
    node,
    targetPaneId,
    axis === 'row' ? 'right' : 'bottom',
    newPaneId,
  );

/**
 * Replaces the leaf for `targetPaneId` with a split of itself and `paneId`, on
 * the side given.
 *
 * The one insertion primitive: splitting a pane is inserting a *new* pane to
 * its right or below it, and moving a pane is inserting an *existing* one on
 * any of the four sides.
 */
export const insertPaneBeside = (
  node: LayoutNode,
  targetPaneId: PaneId,
  side: PaneDropSide,
  paneId: PaneId,
): LayoutNode => {
  if (node.kind === 'pane') {
    if (node.paneId !== targetPaneId) {
      return node;
    }

    const axis: SplitAxis =
      side === 'left' || side === 'right' ? 'row' : 'column';

    return side === 'left' || side === 'top'
      ? splitNode(axis, paneNode(paneId), node)
      : splitNode(axis, node, paneNode(paneId));
  }

  return {
    ...node,
    first: insertPaneBeside(node.first, targetPaneId, side, paneId),
    second: insertPaneBeside(node.second, targetPaneId, side, paneId),
  };
};

/**
 * Exchanges two panes' places in the tree.
 *
 * This is what dropping a pane onto the middle of another does, and it moves
 * the *layout* rather than the pages: each pane keeps its address, its
 * history, its scroll position and its sandbox setting, and takes the other's
 * rectangle. Nothing reloads, because an `iframe` element never moves — only
 * the rectangle it is positioned into does.
 *
 * A pane the tree does not have is refused outright rather than half-applied:
 * renaming one leaf to an id nothing else knows would drop a pane out of the
 * layout while leaving its state behind.
 */
export const swapPanesAt = (
  node: LayoutNode,
  a: PaneId,
  b: PaneId,
): LayoutNode => {
  const present = paneIdsOf(node);

  if (a === b || !present.includes(a) || !present.includes(b)) {
    return node;
  }

  const swapped = (target: LayoutNode): LayoutNode =>
    target.kind === 'pane'
      ? target.paneId === a
        ? paneNode(b)
        : target.paneId === b
          ? paneNode(a)
          : target
      : ({
          ...target,
          first: swapped(target.first),
          second: swapped(target.second),
        } as const);

  return swapped(node);
};

/**
 * Takes a pane out of the tree and re-attaches it to one side of another.
 *
 * The sibling it leaves behind takes over the space it had, exactly as closing
 * it would — but the pane itself, and everything loaded in it, survives the
 * journey.
 */
export const movePaneBeside = (
  node: LayoutNode,
  movedPaneId: PaneId,
  targetPaneId: PaneId,
  side: PaneDropSide,
): LayoutNode => {
  const present = paneIdsOf(node);

  if (
    movedPaneId === targetPaneId ||
    !present.includes(movedPaneId) ||
    !present.includes(targetPaneId)
  ) {
    return node;
  }

  const without = removePaneAt(node, movedPaneId);

  // Unreachable while both panes are in the tree — removing one of two or more
  // leaves always leaves something — but the type says otherwise, and a moved
  // pane is not worth losing to a proof.
  return without === undefined
    ? node
    : insertPaneBeside(without, targetPaneId, side, movedPaneId);
};

/**
 * Removes a pane, promoting its sibling into the space the split occupied.
 * Returns `undefined` when the pane removed was the whole tree, which the
 * caller has to treat as "refuse to close the last pane".
 */
export const removePaneAt = (
  node: LayoutNode,
  targetPaneId: PaneId,
): LayoutNode | undefined => {
  if (node.kind === 'pane') {
    return node.paneId === targetPaneId ? undefined : node;
  }

  const first = removePaneAt(node.first, targetPaneId);

  const second = removePaneAt(node.second, targetPaneId);

  if (first === undefined) {
    return second;
  }

  if (second === undefined) {
    return first;
  }

  return { ...node, first, second };
};

/** Sets the ratio of the split node at `path`, clamped away from the edges. */
export const updateRatioAt = (
  node: LayoutNode,
  path: NodePath,
  ratio: number,
): LayoutNode => {
  if (node.kind === 'pane') {
    return node;
  }

  if (!Arr.isNonEmpty(path)) {
    return { ...node, ratio: clampRatio(ratio) };
  }

  const [head, ...rest] = path;

  return head === 'first'
    ? { ...node, first: updateRatioAt(node.first, rest, ratio) }
    : { ...node, second: updateRatioAt(node.second, rest, ratio) };
};

/**
 * Keeps a divider from being dragged onto the edge of its node, which would
 * leave a pane too small to have a toolbar, and therefore too small to be
 * dragged back or closed.
 */
export const clampRatio = (ratio: number): number =>
  Number.isFinite(ratio) ? Math.min(0.95, Math.max(0.05, ratio)) : 0.5;

/**
 * Builds an evenly divided chain of panes along one axis: three ids on the
 * `row` axis give three equal columns.
 */
export const evenChain = (
  axis: SplitAxis,
  paneIds: readonly PaneId[],
): LayoutNode => evenChainOf(axis, paneIds.map(paneNode));

/**
 * `evenChain` over subtrees rather than panes, which is what a grid needs: a
 * row of three columns is this over three `evenChain('column', ...)`.
 */
export const evenChainOf = (
  axis: SplitAxis,
  nodes: readonly LayoutNode[],
): LayoutNode => {
  if (!Arr.isNonEmpty(nodes)) {
    throw new Error('evenChainOf: at least one node is required');
  }

  const [head, ...rest] = nodes;

  return Arr.isNonEmpty(rest)
    ? splitNode(axis, head, evenChainOf(axis, rest), firstShareOf(nodes.length))
    : head;
};

/** The share of the whole that the first of `count` equal parts takes. */
const firstShareOf = (count: number): number => {
  const total = Math.max(1, count);

  return Num.isNonZero(total) ? Num.div(1, total) : 0.5;
};
