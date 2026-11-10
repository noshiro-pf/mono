import { Arr, Num } from 'ts-data-forge';
import { clampRatio, maxRatio, minRatio } from './tree.mjs';
import type {
  DropZone,
  FixedSize,
  LayoutNode,
  NodePath,
  PaneId,
  Rect,
  SplitAxis,
} from './types.mjs';

export type PaneRect = Readonly<{ paneId: PaneId; rect: Rect }>;

/** One divider, with what a drag or a key needs to move it. */
export type Divider = Readonly<{
  path: NodePath;
  axis: SplitAxis;
  /** The divider itself. */
  rect: Rect;
  /** The rect it divides. */
  nodeRect: Rect;
  /** The space its two children share: the node less the gutter. */
  availablePx: number;
  /** How much of that the first child has. */
  firstPx: number;
  /** Held child, when the node holds one. */
  fixed: FixedSize | undefined;
}>;

export type LayoutGeometry = Readonly<{
  panes: readonly PaneRect[];
  dividers: readonly Divider[];
}>;

/** Where a dragged pane would land, and the part of the target it would fill. */
export type DropTarget = Readonly<{
  paneId: PaneId;
  zone: DropZone;
  indicator: Rect;
}>;

/**
 * The tree flattened into rectangles, in pixels, so that the gutter is the same
 * at every depth and a drag is a subtraction. A flat list of panes is what lets
 * the page keep every `iframe` a sibling in a fixed order.
 */
export const computeGeometry = (
  root: LayoutNode,
  bounds: Rect,
  gutter: number,
): LayoutGeometry => walk(root, bounds, [], gutter);

/**
 * The pane under `point` other than `moving`, and what dropping there does: the
 * outer quarter of a side takes that side, the rest swaps. Tested against the
 * rectangles rather than the DOM, since a pointer over a pane is over its
 * `iframe`, which is the framed site's.
 */
export const dropTargetAt = (
  geometry: LayoutGeometry,
  point: Readonly<{ x: number; y: number }>,
  moving: PaneId,
): DropTarget | undefined => {
  const over = geometry.panes.find(
    ({ paneId, rect: paneRect }) =>
      paneId !== moving &&
      paneRect.left <= point.x &&
      point.x < paneRect.left + paneRect.width &&
      paneRect.top <= point.y &&
      point.y < paneRect.top + paneRect.height,
  );

  if (over === undefined) {
    return undefined;
  }

  const { rect } = over;

  if (!Num.isNonZero(rect.width) || !Num.isNonZero(rect.height)) {
    return undefined;
  }

  const zone = zoneOf(
    Num.div(point.x - rect.left, rect.width),
    Num.div(point.y - rect.top, rect.height),
  );

  return { paneId: over.paneId, zone, indicator: indicatorOf(rect, zone) };
};

/**
 * Where a divider's first child ends when the pointer is at `pointer` (in stage
 * pixels along the divider's axis): the divider centred under the pointer.
 */
export const firstPxAtPointer = (
  divider: Divider,
  pointer: number,
  gutter: number,
): number => {
  const start =
    divider.axis === 'row' ? divider.nodeRect.left : divider.nodeRect.top;

  return pointer - start - Num.div(gutter, 2);
};

/**
 * The divider's position for assistive technology: the first child's share of
 * the node in whole percent, and the range a drag can reach.
 */
export const dividerValue = (
  divider: Divider,
): Readonly<{ now: number; min: number; max: number }> =>
  ({
    now: Num.isNonZero(divider.availablePx)
      ? Math.round(Num.div(divider.firstPx, divider.availablePx) * 100)
      : (50 as const),
    min: Math.round(minRatio * 100),
    max: Math.round(maxRatio * 100),
  }) as const;

/** A divider key and what it asks for. */
export type DividerKey = 'decrease' | 'increase' | 'max' | 'min';

/**
 * Where a key moves a divider to, as the first child's size: an arrow by a step
 * of 2% (at least a pixel), `Home` and `End` to the ends of the range.
 */
export const firstPxAfterKey = (divider: Divider, key: DividerKey): number => {
  const step = Math.max(1, Math.round(divider.availablePx * keyStep));

  switch (key) {
    case 'decrease':
      return divider.firstPx - step;

    case 'increase':
      return divider.firstPx + step;

    case 'min':
      return Math.round(divider.availablePx * minRatio);

    case 'max':
      return Math.round(divider.availablePx * maxRatio);
  }
};

/** Which divider key a `KeyboardEvent.key` is, along `axis`. */
export const dividerKeyOf = (
  axis: SplitAxis,
  key: string,
): DividerKey | undefined => {
  switch (key) {
    case 'Home':
      return 'min';

    case 'End':
      return 'max';

    case 'ArrowLeft':
      return axis === 'row' ? 'decrease' : undefined;

    case 'ArrowRight':
      return axis === 'row' ? 'increase' : undefined;

    case 'ArrowUp':
      return axis === 'column' ? 'decrease' : undefined;

    case 'ArrowDown':
      return axis === 'column' ? 'increase' : undefined;

    default:
      return undefined;
  }
};

const keyStep = 0.02;

/** How much of a pane, along each edge, means "that side" rather than "swap". */
const edgeShare = 0.25;

const zoneOf = (fromLeft: number, fromTop: number): DropZone => {
  const nearest = (
    [
      { zone: 'left', distance: fromLeft },
      { zone: 'right', distance: 1 - fromLeft },
      { zone: 'top', distance: fromTop },
      { zone: 'bottom', distance: 1 - fromTop },
    ] as const
  ).reduce((best, candidate) =>
    candidate.distance < best.distance ? candidate : best,
  );

  return nearest.distance < edgeShare ? nearest.zone : 'center';
};

const indicatorOf = (rect: Rect, zone: DropZone): Rect => {
  const halfWidth = Num.div(rect.width, 2);

  const halfHeight = Num.div(rect.height, 2);

  switch (zone) {
    case 'center':
      return rect;

    case 'left':
      return { ...rect, width: halfWidth };

    case 'right':
      return { ...rect, left: rect.left + halfWidth, width: halfWidth };

    case 'top':
      return { ...rect, height: halfHeight };

    case 'bottom':
      return { ...rect, top: rect.top + halfHeight, height: halfHeight };
  }
};

/**
 * How much of `available` the first child gets. A held size is kept within the
 * range a dragged ratio is, so a window narrower than it still leaves both
 * panes their toolbar.
 */
const firstSizeOf = (
  available: number,
  ratio: number,
  fixed: FixedSize | undefined,
): number => {
  if (fixed === undefined) {
    return Math.round(available * clampRatio(ratio));
  }

  const first = fixed.child === 'first' ? fixed.px : available - fixed.px;

  return Math.min(
    Math.round(available * maxRatio),
    Math.max(Math.round(available * minRatio), Math.round(first)),
  );
};

const walk = (
  node: LayoutNode,
  rect: Rect,
  path: NodePath,
  gutter: number,
): LayoutGeometry => {
  if (node.kind === 'pane') {
    return { panes: [{ paneId: node.paneId, rect }], dividers: [] };
  }

  const isRow = node.axis === 'row';

  const availablePx = Math.max(0, (isRow ? rect.width : rect.height) - gutter);

  const firstPx = firstSizeOf(availablePx, node.ratio, node.fixed);

  const secondPx = availablePx - firstPx;

  const [firstRect, dividerRect, secondRect] = isRow
    ? ([
        { ...rect, width: firstPx },
        { ...rect, left: rect.left + firstPx, width: gutter },
        { ...rect, left: rect.left + firstPx + gutter, width: secondPx },
      ] as const)
    : ([
        { ...rect, height: firstPx },
        { ...rect, top: rect.top + firstPx, height: gutter },
        { ...rect, top: rect.top + firstPx + gutter, height: secondPx },
      ] as const);

  const first = walk(
    node.first,
    firstRect,
    Arr.toPushed(path, 'first'),
    gutter,
  );

  const second = walk(
    node.second,
    secondRect,
    Arr.toPushed(path, 'second'),
    gutter,
  );

  return {
    panes: [...first.panes, ...second.panes],
    dividers: [
      ...first.dividers,
      ...second.dividers,
      {
        path,
        axis: node.axis,
        rect: dividerRect,
        nodeRect: rect,
        availablePx,
        firstPx,
        fixed: node.fixed,
      },
    ],
  };
};
