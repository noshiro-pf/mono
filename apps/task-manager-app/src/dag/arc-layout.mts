/**
 * The arc diagram's layout: the tasks alone, one below another in a single
 * column, in the order the diagrams share (`diagram-order.mts`), with the
 * dependencies drawn as arcs beside it (`arc-edges.mts`, `arc-geometry.mts`).
 * Milestones are not drawn; a dependency that goes through them is drawn as
 * a dashed arc between the tasks at its ends.
 *
 * The positions follow from the data alone, so they are never saved and
 * nobody moves a node: the stored arrangement is the DAG's only.
 */

import { type GraphNodeId } from '../domain/index.mjs';
import { type NodeSize } from '../view-model/index.mjs';
import { nodeBoxSize, type LaidOutNode } from './graph-layout.mjs';
import { type Point, type Size } from './pan-zoom.mjs';

/** Between two tasks of the column. */
export const ARC_NODE_GAP = 16;

/**
 * The nodes `ids`, each of `size`, one below another in the order given,
 * `gap` apart, with the column's left edge at x = 0.
 */
export const arcLayout = (
  ids: readonly GraphNodeId[],
  size: Size,
  gap: number,
): ReadonlyMap<GraphNodeId, Point> =>
  new Map(
    ids.map(
      (id, index) => [id, { x: 0, y: index * (size.height + gap) }] as const,
    ),
  );

/**
 * The tasks `ids`, in the diagrams' order (`diagramTaskIds`), down the
 * column, each the size of a task at `nodeSize`: the smaller the nodes, the
 * closer the column.
 */
export const arcDiagramNodes = (
  ids: readonly GraphNodeId[],
  nodeSize: NodeSize,
): readonly LaidOutNode[] => {
  const size = nodeBoxSize('task', nodeSize);

  const positions = arcLayout(ids, size, ARC_NODE_GAP);

  return ids.map((id) => {
    const { x, y } = positions.get(id) ?? { x: 0, y: 0 };

    return { id, kind: 'task', x, y, ...size } as const;
  });
};
