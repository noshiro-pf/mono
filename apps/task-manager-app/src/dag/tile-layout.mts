/**
 * 「タイル」's layout: the tasks alone, with no edges, in rows from the top
 * left across the width of the canvas, as many to a row as fit and wrapping
 * to the next, in the order the diagrams share (`diagram-order.mts`). The
 * view is never zoomed and is read by scrolling down (`tile-scroll.mts`).
 *
 * The positions follow from the data and the width of the canvas, so they
 * are never saved and nobody moves a node; a change of width moves them to
 * their new rows.
 */

import { Num } from 'ts-data-forge';
import type { GraphNodeId } from '../domain/index.mjs';
import type { NodeSize } from '../view-model/index.mjs';
import { nodeBoxSize, type LaidOutNode } from './graph-layout.mjs';
import type { Point, Size } from './pan-zoom.mjs';

/** Between two tasks, across a row and down a column. */
export const TILE_NODE_GAP = 16;

/** Clear on either side of the rows, and their left edge on the canvas. */
export const TILE_MARGIN = 16;

/**
 * How many nodes `nodeWidth` wide fit across `available`, `gap` apart: at
 * least one, which a canvas narrower than a node still shows.
 */
export const tileColumns = (
  nodeWidth: number,
  gap: number,
  available: number,
): number => Math.max(1, Math.floor(ratio(available + gap, nodeWidth + gap)));

/**
 * The nodes `ids`, each of `size`, row by row from the top left in the order
 * given — as many to a row as fit `available`, `gap` apart either way — with
 * the first row's left edge at (0, 0).
 */
export const tileLayout = <K,>(
  ids: readonly K[],
  size: Size,
  gap: number,
  available: number,
): ReadonlyMap<K, Point> => {
  const columns = tileColumns(size.width, gap, available);

  return new Map(
    ids.map(
      (id, index) =>
        [
          id,
          {
            x: (index % columns) * (size.width + gap),
            y: Math.floor(ratio(index, columns)) * (size.height + gap),
          },
        ] as const,
    ),
  );
};

/** How wide the rows may be on a canvas `canvasWidth` wide, at zoom 1. */
export const tileAvailableWidth = (canvasWidth: number): number =>
  canvasWidth - 2 * TILE_MARGIN;

/**
 * The tasks `ids`, in the diagrams' order (`diagramTaskIds`), in rows
 * `available` wide, each the size of a task at `nodeSize` — the smaller,
 * the more to a row; none while the width of the canvas is not known.
 */
export const tileDiagramNodes = (
  ids: readonly GraphNodeId[],
  available: number | undefined,
  nodeSize: NodeSize,
): readonly LaidOutNode[] => {
  if (available === undefined) {
    return [];
  }

  const size = nodeBoxSize('task', nodeSize);

  const positions = tileLayout(ids, size, TILE_NODE_GAP, available);

  return ids.map((id) => {
    const { x, y } = positions.get(id) ?? { x: 0, y: 0 };

    return { id, kind: 'task', x, y, ...size } as const;
  });
};

/** From the top of the first row to the bottom of the last. */
export const tileContentHeight = (nodes: readonly LaidOutNode[]): number =>
  Math.max(0, ...nodes.map(({ y, height }) => y + height));

/** `a / b`, or 0 for a zero `b`. */
const ratio = (a: number, b: number): number =>
  Num.isNonZero(b) ? Num.div(a, b) : 0;
