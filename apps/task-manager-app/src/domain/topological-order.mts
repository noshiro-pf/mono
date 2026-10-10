import { Arr, Result } from 'ts-data-forge';
import { findCycle } from './cycle.mjs';
import {
  buildDependentIds,
  buildSourceIds,
  listNodes,
  type GraphNodeId,
} from './graph-nodes.mjs';
import type { DomainState, NodeRef } from './types.mjs';

/**
 * Every node, each after the nodes it depends on — or, when there is no such
 * order, the cycle {@link findCycle} reports.
 *
 * Among the nodes free to come next, the one earliest in the order of
 * `listNodes` (tasks in input order, then milestones) comes first, so the
 * order stays as close to the input as the dependencies allow.
 */
export const topologicalOrder = (
  state: DomainState,
): Result<readonly NodeRef[], readonly NodeRef[]> => {
  const cycle = findCycle(state);

  return cycle === undefined ? Result.ok(orderDag(state)) : Result.err(cycle);
};

/** Kahn's algorithm, picking the free node earliest in node order. */
const orderDag = (state: DomainState): readonly NodeRef[] => {
  const nodes = listNodes(state);

  const nodeIndex: ReadonlyMap<GraphNodeId, number> = new Map(
    nodes.map(({ id }, index) => [id, index]),
  );

  const byNodeIndex = (a: GraphNodeId, b: GraphNodeId): number =>
    (nodeIndex.get(a) ?? 0) - (nodeIndex.get(b) ?? 0);

  const refs: ReadonlyMap<GraphNodeId, NodeRef> = new Map(
    nodes.map(({ id, ref }) => [id, ref]),
  );

  const dependents = buildDependentIds(state);

  const mut_remaining = new Map(
    Array.from(buildSourceIds(state), ([id, sources]) => [id, sources.length]),
  );

  const mut_order: NodeRef[] = [];

  let mut_free: readonly GraphNodeId[] = nodes
    .map(({ id }) => id)
    .filter((id) => mut_remaining.get(id) === 0);

  while (Arr.isNonEmpty(mut_free)) {
    const [id, ...rest] = mut_free;

    const ref = refs.get(id);

    if (ref !== undefined) {
      mut_order.push(ref);
    }

    const released = (dependents.get(id) ?? []).filter((dependent) => {
      const remaining = (mut_remaining.get(dependent) ?? 0) - 1;

      mut_remaining.set(dependent, remaining);

      return remaining === 0;
    });

    mut_free = [...rest, ...released].toSorted(byNodeIndex);
  }

  return mut_order;
};
