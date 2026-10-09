/**
 * The arcs of the arc diagram, which shows the tasks alone: every dependency
 * of a task on a task, and — drawn dashed — every task a task waits for
 * through milestones. For a task `T` that depends on a milestone `M`, the
 * walk follows `M`'s dependencies through milestones only, and each task it
 * reaches gets a derived arc to `T`. It stops at a task: what that task
 * waits for is its own arc.
 *
 * A pair already joined by a dependency gets no derived arc, and a pair
 * reached by several paths gets one, through the first path found (in the
 * order of the dependencies). The editor never saves a cycle, but a walk
 * visits a milestone at most once per task and draws no task to itself, so
 * a cycle in the data could not hang it.
 */

import { Arr } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import {
  buildDependencyGraph,
  nodeId,
  type DomainState,
  type GraphNodeId,
} from '../domain/index.mjs';
import { dependencyTypeLabels, formatLag } from '../view-model/index.mjs';
import { edgeLabel } from './graph-layout.mjs';

export const arcEdges = (state: DomainState): readonly ArcEdge[] => {
  const titleEntries: readonly (readonly [GraphNodeId, string])[] = [
    ...state.tasks.map(
      ({ id, title }) => [nodeId({ kind: 'task', id }), title] as const,
    ),
    ...state.milestones.map(
      ({ id, title }) => [nodeId({ kind: 'milestone', id }), title] as const,
    ),
  ] as const;

  const titles = new Map(titleEntries);

  const titleOf = (id: GraphNodeId): string => titles.get(id) ?? '';

  const direct = buildDependencyGraph(state).edges.flatMap(
    (edge): readonly ArcEdge[] => {
      if (!isTask(edge.from) || !isTask(edge.to)) {
        return [];
      }

      const lag = formatLag(edge.lagMs);

      const kind =
        edge.type === undefined ? '' : dependencyTypeLabels[edge.type];

      const how = [kind, lag].filter((part) => part !== '').join('・');

      return [
        {
          id: edge.id,
          from: edge.from,
          to: edge.to,
          derived: false,
          label: edgeLabel(edge),
          via: [],
          ariaLabel: `${titleOf(edge.from)} → ${titleOf(edge.to)}${how === '' ? '' : `（${how}）`}`,
        },
      ];
    },
  );

  const milestoneSources = new Map(
    state.milestones.map(
      ({ id, dependencies }) =>
        [
          nodeId({ kind: 'milestone', id }),
          dependencies.map(({ from }) => nodeId(from)),
        ] as const,
    ),
  );

  const mut_drawn = new Set(direct.map(({ from, to }) => pairKey(from, to)));

  const derived = state.tasks.flatMap((task) => {
    const to = nodeId({ kind: 'task', id: task.id });

    const reached = reachedThroughMilestones(
      task.dependencies.map(({ from }) => nodeId(from)),
      milestoneSources,
      titles,
    );

    return reached.flatMap(({ from, via }): readonly ArcEdge[] => {
      const key = pairKey(from, to);

      if (from === to || mut_drawn.has(key)) {
        return [];
      }

      mut_drawn.add(key);

      return [
        {
          id: `derived:${key}`,
          from,
          to,
          derived: true,
          label: '',
          via,
          ariaLabel: `${titleOf(from)} → ${titleOf(to)}（マイルストーン ${via.map(titleOf).join(' → ')} 経由）`,
        },
      ];
    });
  });

  return [...direct, ...derived];
};

/**
 * A dependency between two tasks as the arc diagram draws it: one of a task
 * on a task, or one derived through milestones.
 */
export type ArcEdge = DeepReadonly<{
  id: string;
  from: GraphNodeId;
  to: GraphNodeId;
  /** Through milestones, rather than a dependency of `to` on `from`. */
  derived: boolean;
  /** As the DAG labels the edge: `SS`, the lag. Empty for a derived one. */
  label: string;
  /** The milestones a derived edge goes through, from `from` to `to`. */
  via: GraphNodeId[];
  /** `A → B（完了後）`, `A → C（マイルストーン M 経由）`. */
  ariaLabel: string;
}>;

const isTask = (id: GraphNodeId): boolean => id.startsWith('task:');

const pairKey = (from: GraphNodeId, to: GraphNodeId): string =>
  `${from}>${to}` as const;

/**
 * The tasks reached from `sources` (one task's dependencies) through
 * milestones only, each once, with the milestones on the way from it to the
 * task. Depth first, in the order of the dependencies; a milestone that does
 * not exist leads nowhere.
 */
const reachedThroughMilestones = (
  sources: readonly GraphNodeId[],
  milestoneSources: ReadonlyMap<GraphNodeId, readonly GraphNodeId[]>,
  nodes: ReadonlyMap<GraphNodeId, unknown>,
): readonly Readonly<{ from: GraphNodeId; via: readonly GraphNodeId[] }>[] => {
  const mut_visited = new Set<GraphNodeId>();

  const walk = (
    milestone: GraphNodeId,
    // From `milestone` back towards the task that waits.
    path: readonly GraphNodeId[],
  ): readonly Readonly<{
    from: GraphNodeId;
    via: readonly GraphNodeId[];
  }>[] => {
    if (mut_visited.has(milestone)) {
      return [];
    }

    mut_visited.add(milestone);

    return (milestoneSources.get(milestone) ?? []).flatMap((source) =>
      isTask(source)
        ? nodes.has(source)
          ? [{ from: source, via: path }]
          : []
        : walk(source, Arr.toUnshifted(source)(path)),
    );
  };

  return sources.flatMap((source) =>
    isTask(source) || !milestoneSources.has(source)
      ? []
      : walk(source, [source]),
  );
};
