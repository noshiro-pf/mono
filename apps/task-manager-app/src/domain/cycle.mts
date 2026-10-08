import { Arr } from 'ts-data-forge';
import {
  buildDependentIds,
  listNodes,
  nodeId,
  type GraphNodeId,
} from './graph-nodes.mjs';
import { type DomainState, type NodeRef } from './types.mjs';

/**
 * A dependency cycle, or `undefined` when the graph is a DAG.
 *
 * The cycle is listed in edge direction — each node is depended on by the
 * next — and closed, its first node repeated at the end: `[a, b, a]` means b
 * depends on a and a on b, and a self-dependency is `[a, a]`. The search
 * visits nodes in the order of `listNodes`, so the same state gives the same
 * cycle.
 */
export const findCycle = (
  state: DomainState,
): readonly NodeRef[] | undefined => {
  const nodes = listNodes(state);

  const refs: ReadonlyMap<GraphNodeId, NodeRef> = new Map(
    nodes.map(({ id, ref }) => [id, ref]),
  );

  const cycle = findCycleIds(
    nodes.map(({ id }) => id),
    buildDependentIds(state),
  );

  return cycle?.flatMap((id) => {
    const ref = refs.get(id);

    return ref === undefined ? [] : [ref];
  });
};

/**
 * Whether making `dependent` depend on `source` would close a cycle — that
 * is, whether `source` already depends on `dependent`, directly or not.
 * Depending on oneself is a cycle. Check this before applying an edit.
 */
export const wouldCreateCycle = (
  state: DomainState,
  dependent: NodeRef,
  source: NodeRef,
): boolean => {
  const dependentId = nodeId(dependent);

  const sourceId = nodeId(source);

  if (dependentId === sourceId) {
    return true;
  }

  const dependents = buildDependentIds(state);

  const mut_seen = new Set<GraphNodeId>([dependentId]);

  let mut_frontier: readonly GraphNodeId[] = [dependentId];

  while (Arr.isNonEmpty(mut_frontier)) {
    const next = mut_frontier
      .flatMap((id) => dependents.get(id) ?? [])
      .filter((id) => !mut_seen.has(id));

    if (next.includes(sourceId)) {
      return true;
    }

    for (const id of next) {
      mut_seen.add(id);
    }

    mut_frontier = next;
  }

  return false;
};

/** Depth-first search for a back edge, closed as {@link findCycle} says. */
const findCycleIds = (
  ids: readonly GraphNodeId[],
  dependents: ReadonlyMap<GraphNodeId, readonly GraphNodeId[]>,
): readonly GraphNodeId[] | undefined => {
  const mut_state = new Map<GraphNodeId, 'on-path' | 'finished'>();

  const mut_path: GraphNodeId[] = [];

  const visit = (id: GraphNodeId): readonly GraphNodeId[] | undefined => {
    mut_state.set(id, 'on-path');

    mut_path.push(id);

    for (const next of dependents.get(id) ?? []) {
      const state = mut_state.get(next);

      if (state === 'on-path') {
        return Arr.toPushed(mut_path.slice(mut_path.indexOf(next)), next);
      }

      if (state === 'finished') {
        continue;
      }

      const cycle = visit(next);

      if (cycle !== undefined) {
        return cycle;
      }
    }

    mut_path.pop();

    mut_state.set(id, 'finished');

    return undefined;
  };

  for (const id of ids) {
    if (mut_state.has(id)) {
      continue;
    }

    const cycle = visit(id);

    if (cycle !== undefined) {
      return cycle;
    }
  }

  return undefined;
};
