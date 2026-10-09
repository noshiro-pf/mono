/**
 * The dependency DAG as nodes and edges, for a renderer to lay out. An edge
 * runs from the node depended on to the node that depends on it. Node ids
 * are stable strings, so a renderer can key on them across rebuilds.
 */

import { type DeepReadonly } from 'ts-type-forge';
import { listNodes, nodeId, type GraphNodeId } from './graph-nodes.mjs';
import {
  isTaskDependency,
  type DependencyType,
  type DomainState,
  type NodeRef,
} from './types.mjs';

/**
 * Nodes: every task in input order, then every milestone. Edges: one per
 * dependency, in node order and then dependency order, with the id
 * `<dependent node id>#<index of the dependency>`. A dependency on a node
 * that does not exist has no edge.
 */
export const buildDependencyGraph = (state: DomainState): DependencyGraph => {
  const nodes = listNodes(state);

  const ids: ReadonlySet<GraphNodeId> = new Set(nodes.map(({ id }) => id));

  return {
    nodes: nodes.map(({ id, ref }) => ({ id, ref })),
    edges: nodes.flatMap(({ id, dependencies }) =>
      dependencies.flatMap((dependency, index) => {
        const from = nodeId(dependency.from);

        return ids.has(from)
          ? [
              {
                id: `${id}#${index}`,
                from,
                to: id,
                type: isTaskDependency(dependency)
                  ? dependency.type
                  : undefined,
                lagMs: dependency.lagMs,
              },
            ]
          : [];
      }),
    ),
  };
};

export type DependencyGraph = DeepReadonly<{
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
}>;

export type DependencyGraphNode = DeepReadonly<{
  id: GraphNodeId;
  ref: NodeRef;
}>;

export type DependencyGraphEdge = DeepReadonly<{
  id: string;
  from: GraphNodeId;
  to: GraphNodeId;
  /** `undefined` when the source is a milestone, which has no duration. */
  type: DependencyType | undefined;
  lagMs: number;
}>;
