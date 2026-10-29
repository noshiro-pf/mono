/**
 * The arcs of the arc diagram, which draws the tasks and the milestones as
 * the DAG does: one for every dependency, between the two nodes it joins.
 */

import type { DeepReadonly } from 'ts-type-forge';
import {
  buildDependencyGraph,
  nodeId,
  type DomainState,
  type GraphNodeId,
} from '../domain/index.mjs';
import { m } from '../i18n/index.mjs';
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

  return buildDependencyGraph(state).edges.map((edge): ArcEdge => {
    const lag = formatLag(edge.lagMs);

    const kind = edge.type === undefined ? '' : dependencyTypeLabels[edge.type];

    const how = [kind, lag]
      .filter((part) => part !== '')
      .join(m.common.listSeparator);

    return {
      id: edge.id,
      from: edge.from,
      to: edge.to,
      label: edgeLabel(edge),
      ariaLabel: m.dag.edgeLabel(titleOf(edge.from), titleOf(edge.to), how),
    };
  });
};

/** A dependency as the arc diagram draws it. */
export type ArcEdge = DeepReadonly<{
  id: string;
  from: GraphNodeId;
  to: GraphNodeId;
  /** As the DAG labels the edge: `SS`, the lag. */
  label: string;
  /** `A → B（完了後）`. */
  ariaLabel: string;
}>;
