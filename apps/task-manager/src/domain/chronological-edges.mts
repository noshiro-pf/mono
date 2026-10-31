/**
 * The order in time of the milestones that have a date, as edges of the
 * dependency graph: one from each such milestone to each of the next date, so
 * that the DAG lays them out in that order. Only neighbors in time are joined,
 * since the rest of the order follows from theirs.
 *
 * These edges are not dependencies: nothing is stored for them, nothing waits
 * on them, and they follow the dates as they change. Where the dependencies
 * already order two neighbors, either way, none is added — so that none is
 * drawn twice, none points against what the reader made, and none closes a
 * cycle.
 */

import { Arr } from 'ts-data-forge';
import type {
  DependencyGraph,
  DependencyGraphEdge,
} from './dependency-graph.mjs';
import { nodeId, type GraphNodeId } from './graph-nodes.mjs';
import type { DomainState } from './types.mjs';

/**
 * `graph` with an edge, `implied`, from every milestone of `state` that is one
 * of its nodes and has a date to every such milestone of the next date, unless
 * the edges already order the two. They come after those of `graph`, in order
 * of date and then of the milestones.
 */
export const withChronologicalEdges = (
  state: DomainState,
  graph: DependencyGraph,
): DependencyGraph => {
  const nodeIds: ReadonlySet<GraphNodeId> = new Set(
    graph.nodes.map(({ id }) => id),
  );

  const dated = state.milestones
    .map(({ id, date }) => ({ id: nodeId({ kind: 'milestone', id }), date }))
    .filter(
      (entry): entry is Readonly<{ id: GraphNodeId; date: number }> =>
        entry.date !== undefined && nodeIds.has(entry.id),
    )
    .toSorted((a, b) => a.date - b.date);

  const byDate = Array.from(
    Map.groupBy(dated, ({ date }) => date).values(),
    (entries) => entries.map(({ id }) => id),
  );

  const mut_targets = new Map<GraphNodeId, readonly GraphNodeId[]>();

  const join = (from: GraphNodeId, to: GraphNodeId): void => {
    mut_targets.set(from, Arr.toPushed(mut_targets.get(from) ?? [], to));
  };

  for (const { from, to } of graph.edges) {
    join(from, to);
  }

  const reaches = (from: GraphNodeId, to: GraphNodeId): boolean => {
    const mut_seen = new Set<GraphNodeId>([from]);

    const mut_stack: GraphNodeId[] = [from];

    for (
      let mut_current = mut_stack.pop();
      mut_current !== undefined;
      mut_current = mut_stack.pop()
    ) {
      const current = mut_current;

      if (current === to) {
        return true;
      }

      for (const next of mut_targets.get(current) ?? []) {
        if (mut_seen.has(next)) {
          continue;
        }

        mut_seen.add(next);

        mut_stack.push(next);
      }
    }

    return false;
  };

  const added = Arr.tail(byDate).flatMap((later, index) =>
    (byDate[index] ?? []).flatMap((from) =>
      later.flatMap((to): readonly DependencyGraphEdge[] => {
        if (reaches(from, to) || reaches(to, from)) {
          return [];
        }

        join(from, to);

        return [
          {
            id: `chronological:${from}>${to}`,
            from,
            to,
            type: undefined,
            lagMs: 0,
            implied: true,
          },
        ];
      }),
    ),
  );

  return { nodes: graph.nodes, edges: [...graph.edges, ...added] };
};
