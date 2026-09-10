import { Arr, Num } from 'ts-data-forge';
import { clampRatio } from './tree.mjs';
import {
  type LayoutNode,
  type NodePath,
  type PaneDropZone,
  type PaneId,
  type Rect,
  type SplitAxis,
} from './types.mjs';

export type PaneRect = Readonly<{ paneId: PaneId; rect: Rect }>;

export type SplitterRect = Readonly<{
  path: NodePath;
  axis: SplitAxis;
  /** The divider itself. */
  rect: Rect;
  /**
   * The rect the divider divides. A drag reads a pointer position as a fraction
   * of this, so it has to travel with the divider.
   */
  nodeRect: Rect;
}>;

export type LayoutGeometry = Readonly<{
  panes: readonly PaneRect[];
  splitters: readonly SplitterRect[];
}>;

/** Where a dragged pane would land, and what to draw to say so. */
export type PaneDropTarget = Readonly<{
  paneId: PaneId;
  zone: PaneDropZone;
  /** The part of the target pane the drop would fill. */
  indicator: Rect;
}>;

/**
 * How much of a pane, along each edge, means "this side" rather than "swap".
 *
 * A quarter: large enough to hit without aiming, small enough that the middle
 * — the gesture the user reaches for first, and the only one that cannot
 * change the shape of the layout — is most of the pane.
 */
const edgeShare = 0.25;

/**
 * Which pane the pointer is over, and what dropping there would do.
 *
 * It hit-tests the rectangles the layout was drawn from rather than the DOM,
 * because the DOM answer is wrong here: a pointer over a pane is a pointer
 * over an `iframe`, and that belongs to the framed site. The page turns
 * pointer events off for the frames while a drag is in progress and works out
 * where the pointer is from the same numbers it positioned the panes with.
 *
 * The pane being dragged is not a target: dropping onto itself does nothing,
 * and an indicator over it would suggest otherwise.
 */
export const dropTargetAt = (
  geometry: LayoutGeometry,
  point: Readonly<{ x: number; y: number }>,
  movedPaneId: PaneId,
): PaneDropTarget | undefined => {
  const over = geometry.panes.find(
    (entry) =>
      entry.paneId !== movedPaneId &&
      point.x >= entry.rect.left &&
      point.x < entry.rect.left + entry.rect.width &&
      point.y >= entry.rect.top &&
      point.y < entry.rect.top + entry.rect.height,
  );

  if (over === undefined) {
    return undefined;
  }

  const { rect } = over;

  if (!Num.isNonZero(rect.width) || !Num.isNonZero(rect.height)) {
    return undefined;
  }

  const fromLeft = Num.div(point.x - rect.left, rect.width);

  const fromTop = Num.div(point.y - rect.top, rect.height);

  const zone = zoneOf(fromLeft, fromTop);

  return { paneId: over.paneId, zone, indicator: indicatorOf(rect, zone) };
};

/** The nearest edge, when the pointer is close enough to one. */
const zoneOf = (fromLeft: number, fromTop: number): PaneDropZone => {
  const distances = [
    { zone: 'left', distance: fromLeft },
    { zone: 'right', distance: 1 - fromLeft },
    { zone: 'top', distance: fromTop },
    { zone: 'bottom', distance: 1 - fromTop },
  ] as const;

  const nearest = distances.reduce((best, candidate) =>
    candidate.distance < best.distance ? candidate : best,
  );

  return nearest.distance < edgeShare ? nearest.zone : 'center';
};

const indicatorOf = (rect: Rect, zone: PaneDropZone): Rect => {
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
 * Flattens the tree into absolute rectangles.
 *
 * Everything is laid out in pixels rather than percentages so that the gutters
 * stay the same width at every depth, and so that a drag is a subtraction
 * rather than a conversion. The panes come back as a flat list, which is what
 * lets the page render every `iframe` as a sibling in a stable order — moving
 * an `iframe` in the DOM reloads it, so the tree may decide where a pane *is*
 * but never where its element sits.
 */
export const computeGeometry = (
  root: LayoutNode,
  bounds: Rect,
  gutter: number,
): LayoutGeometry => walk(root, bounds, [], gutter);

const walk = (
  node: LayoutNode,
  rect: Rect,
  path: NodePath,
  gutter: number,
): LayoutGeometry => {
  if (node.kind === 'pane') {
    return { panes: [{ paneId: node.paneId, rect }], splitters: [] };
  }

  const [firstRect, dividerRect, secondRect] = divideRect(
    rect,
    node.axis,
    node.ratio,
    gutter,
  );

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
    splitters: [
      ...first.splitters,
      ...second.splitters,
      { path, axis: node.axis, rect: dividerRect, nodeRect: rect },
    ],
  };
};

/** Splits one rect into `first`, the gutter, and `second`. */
const divideRect = (
  rect: Rect,
  axis: SplitAxis,
  ratio: number,
  gutter: number,
): readonly [Rect, Rect, Rect] => {
  if (axis === 'row') {
    const availableWidth = Math.max(0, rect.width - gutter);

    const firstWidth = Math.round(availableWidth * clampRatio(ratio));

    return [
      { ...rect, width: firstWidth },
      { ...rect, left: rect.left + firstWidth, width: gutter },
      {
        ...rect,
        left: rect.left + firstWidth + gutter,
        width: availableWidth - firstWidth,
      },
    ];
  }

  const availableHeight = Math.max(0, rect.height - gutter);

  const firstHeight = Math.round(availableHeight * clampRatio(ratio));

  return [
    { ...rect, height: firstHeight },
    { ...rect, top: rect.top + firstHeight, height: gutter },
    {
      ...rect,
      top: rect.top + firstHeight + gutter,
      height: availableHeight - firstHeight,
    },
  ];
};
