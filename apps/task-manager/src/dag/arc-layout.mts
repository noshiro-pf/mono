/**
 * The arc diagram's layout: the tasks and the milestones, one below another
 * in a single column, with the dependencies drawn as arcs beside it
 * (`arc-edges.mts`, `arc-geometry.mts`). The tasks keep the order the
 * diagrams share (`diagram-order.mts`); each milestone goes in among them
 * next to what it is joined to (`arcDiagramIds`), so that an arc through it
 * stays short.
 *
 * The positions follow from the data alone, so they are never saved and
 * nobody moves a node: the stored arrangement is the DAG's only.
 */

import { Arr } from 'ts-data-forge';
import {
  buildDependentIds,
  buildSourceIds,
  nodeId,
  nodeRefOf,
  type DomainState,
  type GraphNodeId,
} from '../domain/index.mjs';
import type { NodeSize } from '../view-model/index.mjs';
import { nodeBoxSize, type LaidOutNode } from './graph-layout.mjs';

/** Between two nodes of the column. */
export const ARC_NODE_GAP = 16;

/**
 * The column of `state`: the tasks `taskIds`, in that order, and every
 * milestone of `state` among them — just above the first node that waits
 * for it, through milestones too; for one no task waits for, just below the
 * last node it waits for; for one that waits for no task either, just
 * above the first milestone that waits for it; for one joined to nothing,
 * at the end. Milestones that would go in the same place go in the order
 * they hold, one that waits for another below it, and otherwise in the
 * order of `state`.
 *
 * `state` is what is drawn: a task in it but not in `taskIds` is left out,
 * and places nothing. The editor never saves a cycle; a walk round one in
 * the data stops where it started.
 */
export const arcDiagramIds = (
  taskIds: readonly GraphNodeId[],
  state: DomainState,
): readonly GraphNodeId[] => {
  const taskIndex = new Map(taskIds.map((id, index) => [id, index] as const));

  const sources = buildSourceIds(state);

  const dependents = buildDependentIds(state);

  // A place in the column: a task at its index, a milestone half a place
  // above or below the task it goes next to.
  const taskPlace = (id: GraphNodeId, side: number): readonly number[] => {
    const index = taskIndex.get(id);

    return index === undefined ? [] : [index + side];
  };

  // Each walk goes one way only: down through what waits, or up through
  // what is waited for.
  const above = walk((id, visit) =>
    least(
      (dependents.get(id) ?? []).flatMap((dependent) =>
        isTask(dependent)
          ? taskPlace(dependent, -HALF)
          : optional(visit(dependent)),
      ),
    ),
  );

  const below = walk((id, visit) =>
    greatest(
      (sources.get(id) ?? []).flatMap((source) =>
        isTask(source)
          ? taskPlace(source, HALF)
          : optional(above(source) ?? visit(source)),
      ),
    ),
  );

  const placeOf = walk(
    (id, visit) =>
      above(id) ??
      below(id) ??
      least(
        (dependents.get(id) ?? [])
          .filter((dependent) => !isTask(dependent))
          .flatMap((dependent) => optional(visit(dependent))),
      ),
  );

  // How many milestones a milestone waits for, one after another: one that
  // waits for another is deeper.
  const depthOf = walk(
    (id, visit) =>
      greatest(
        (sources.get(id) ?? [])
          .filter((source) => !isTask(source))
          .map((source) => (visit(source) ?? 0) + 1),
      ) ?? 0,
  );

  const end = taskIds.length;

  const entries = [
    ...taskIds.map((id, order) => ({ id, place: order, depth: 0, order })),
    ...state.milestones.map(({ id: milestoneId }, order) => {
      const id = nodeId({ kind: 'milestone', id: milestoneId });

      return {
        id,
        place: placeOf(id) ?? end,
        depth: depthOf(id) ?? 0,
        order,
      };
    }),
  ] as const;

  return entries
    .toSorted((a, b) =>
      a.place !== b.place
        ? a.place - b.place
        : a.depth !== b.depth
          ? a.depth - b.depth
          : a.order - b.order,
    )
    .map(({ id }) => id);
};

/**
 * The nodes `ids` down the column, in the order given (`arcDiagramIds`),
 * each the size of its kind at `nodeSize`, {@link ARC_NODE_GAP} apart: the
 * smaller the nodes, the closer the column. Their right sides, where the
 * arcs are, line up, with the tasks' left edge at x = 0.
 */
export const arcDiagramNodes = (
  ids: readonly GraphNodeId[],
  nodeSize: NodeSize,
): readonly LaidOutNode[] => {
  const right = nodeBoxSize('task', nodeSize).width;

  const sized = ids.map((id) => {
    const { kind } = nodeRefOf(id);

    return { id, kind, ...nodeBoxSize(kind, nodeSize) } as const;
  });

  const tops = sized.reduce<readonly number[]>(
    (acc, _node, index) =>
      index === 0
        ? [0]
        : Arr.toPushed(
            acc,
            (acc.at(-1) ?? 0) + (sized[index - 1]?.height ?? 0) + ARC_NODE_GAP,
          ),
    [],
  );

  return sized.map(
    (node, index) =>
      ({ ...node, x: right - node.width, y: tops[index] ?? 0 }) as const,
  );
};

const HALF = 0.5;

const isTask = (id: GraphNodeId): boolean => id.startsWith('task:');

/**
 * `step` for every node, each worked out once. `step` is handed the walk
 * itself (`walkOn`) for the nodes next to the one it is at; a node it
 * reaches again before it is done — round a cycle — is `undefined`.
 */
const walk = (
  step: (
    node: GraphNodeId,
    walkOn: (next: GraphNodeId) => number | undefined,
  ) => number | undefined,
): ((node: GraphNodeId) => number | undefined) => {
  const mut_done = new Map<GraphNodeId, number | undefined>();

  const visit = (node: GraphNodeId): number | undefined => {
    if (mut_done.has(node)) {
      return mut_done.get(node);
    }

    mut_done.set(node, undefined);

    const result = step(node, visit);

    mut_done.set(node, result);

    return result;
  };

  return visit;
};

const optional = (value: number | undefined): readonly number[] =>
  value === undefined ? ([] as const) : ([value] as const);

const least = (values: readonly number[]): number | undefined =>
  Arr.isNonEmpty(values) ? Math.min(...values) : undefined;

const greatest = (values: readonly number[]): number | undefined =>
  Arr.isNonEmpty(values) ? Math.max(...values) : undefined;
