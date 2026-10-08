/**
 * The dependency graph as adjacency lists keyed by node id, which is what
 * the graph algorithms walk. Every node is a task or a milestone, so any
 * dependency can be part of a cycle; one on a node that does not exist is
 * left out.
 */

import { Arr } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import { type Dependency, type DomainState, type NodeRef } from './types.mjs';

/** A stable string id for a node: `task:<id>` or `milestone:<id>`. */
export const nodeId = (ref: NodeRef): GraphNodeId =>
  `${ref.kind}:${ref.id}` as const;

/** Every node: the tasks in input order, then the milestones. */
export const listNodes = (state: DomainState): readonly GraphNodeEntry[] =>
  [
    ...state.tasks.map(({ id, dependencies }): GraphNodeEntry => {
      const ref = { kind: 'task', id } as const;

      return { id: nodeId(ref), ref, dependencies };
    }),
    ...state.milestones.map(({ id, dependencies }): GraphNodeEntry => {
      const ref = { kind: 'milestone', id } as const;

      return { id: nodeId(ref), ref, dependencies };
    }),
  ] as const;

/** For every node, the nodes it depends on, once each, in dependency order. */
export const buildSourceIds = (
  state: DomainState,
): ReadonlyMap<GraphNodeId, readonly GraphNodeId[]> => {
  const nodes = listNodes(state);

  const ids: ReadonlySet<GraphNodeId> = new Set(nodes.map(({ id }) => id));

  return new Map(
    nodes.map(({ id, dependencies }) => [
      id,
      Arr.uniq(
        dependencies
          .map(({ from }) => nodeId(from))
          .filter((source) => ids.has(source)),
      ),
    ]),
  );
};

/**
 * For every node, the nodes that depend on it, once each, in the order of
 * {@link listNodes}. The reverse of {@link buildSourceIds}.
 */
export const buildDependentIds = (
  state: DomainState,
): ReadonlyMap<GraphNodeId, readonly GraphNodeId[]> => {
  const edges = Array.from(buildSourceIds(state), ([dependent, sources]) =>
    sources.map((source) => ({ source, dependent })),
  ).flat();

  const bySource = Map.groupBy(edges, ({ source }) => source);

  return new Map(
    listNodes(state).map(({ id }) => [
      id,
      (bySource.get(id) ?? []).map(({ dependent }) => dependent),
    ]),
  );
};

export type GraphNodeId = `task:${string}` | `milestone:${string}`;

export type GraphNodeEntry = DeepReadonly<{
  id: GraphNodeId;
  ref: NodeRef;
  dependencies: Dependency[];
}>;
