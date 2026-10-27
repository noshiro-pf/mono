import { Result } from 'ts-data-forge';
import { buildSourceIds, nodeId, type GraphNodeId } from './graph-nodes.mjs';
import { topologicalOrder } from './topological-order.mjs';
import type { DomainState, MilestoneId, NodeRef, TaskId } from './types.mjs';

/**
 * For every node, the length of the longest chain of dependencies above it:
 * `0` for a node that depends on nothing, one more than its deepest source
 * otherwise. Dependencies on nodes that do not exist do not count. With a
 * cycle there is no longest chain, so the result is the cycle
 * `topologicalOrder` reports.
 */
export const dependencyDepth = (
  state: DomainState,
): Result<DependencyDepth, readonly NodeRef[]> =>
  Result.map(topologicalOrder(state), (order) => {
    const sources = buildSourceIds(state);

    const mut_depth = new Map<GraphNodeId, number>();

    for (const ref of order) {
      const id = nodeId(ref);

      mut_depth.set(
        id,
        Math.max(
          0,
          ...(sources.get(id) ?? []).map(
            (source) => (mut_depth.get(source) ?? 0) + 1,
          ),
        ),
      );
    }

    return {
      tasks: new Map(
        state.tasks.map(({ id }) => [
          id,
          mut_depth.get(nodeId({ kind: 'task', id })) ?? 0,
        ]),
      ),
      milestones: new Map(
        state.milestones.map(({ id }) => [
          id,
          mut_depth.get(nodeId({ kind: 'milestone', id })) ?? 0,
        ]),
      ),
    };
  });

export type DependencyDepth = Readonly<{
  tasks: ReadonlyMap<TaskId, number>;
  milestones: ReadonlyMap<MilestoneId, number>;
}>;
