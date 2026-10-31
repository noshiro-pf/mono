/**
 * What the graph screen's filter (`view-model/dag-filter.mts`) leaves of the
 * graph, on top of the nodes `hiddenNodeIds` leaves out already, as two sets of
 * node ids that take the same path as those do — the layout, the arcs, the
 * tiles, the selection:
 *
 * - **kept**: a node in one of the groups chosen, if any are, and, if any
 *   labels are, a task with one of them, or a milestone — which has no
 *   labels — joined by a dependency to such a task. Within a kind, any one
 *   choice is enough; across the kinds, a node is kept only if it passes
 *   each.
 * - **outside**: a node not kept, but joined by a dependency to one that is,
 *   drawn faint, so that what a task waits for, or what waits for it, is
 *   still seen. A node hidden already stays hidden.
 *
 * Every other node is hidden. A node whose group does not exist is in none, as
 * it is drawn; a group or a label chosen that is nowhere now is passed over,
 * and a filter of nothing else keeps every node.
 */

import { Arr } from 'ts-data-forge';
import {
  buildDependentIds,
  buildSourceIds,
  nodeId,
  type DomainState,
  type GraphNodeId,
  type Group,
  type GroupId,
} from '../domain/index.mjs';
import type { DagFilter } from '../view-model/index.mjs';

export type FilteredNodes = Readonly<{
  /** Drawn in no mode: `hidden`, and what the filter leaves out. */
  hidden: ReadonlySet<GraphNodeId>;
  /** Drawn faint: next to the nodes kept, and not kept themselves. */
  outside: ReadonlySet<GraphNodeId>;
}>;

export const filterNodes = (
  state: DomainState,
  groups: readonly Group[],
  filter: DagFilter,
  hidden: ReadonlySet<GraphNodeId>,
): FilteredNodes => {
  const chosen = knownChoices(state, groups, filter);

  if (Arr.isEmpty(chosen.groups) && Arr.isEmpty(chosen.labels)) {
    return { hidden, outside: new Set<GraphNodeId>() } as const;
  }

  const groupIds = new Set(groups.map(({ id }) => id));

  const inGroupChosen = (groupId: GroupId | undefined): boolean =>
    Arr.isEmpty(chosen.groups) ||
    chosen.groups.includes(
      groupId !== undefined && groupIds.has(groupId) ? groupId : undefined,
    );

  const keptTasks = new Set(
    state.tasks
      .filter(
        (task) =>
          inGroupChosen(task.groupId) &&
          (Arr.isEmpty(chosen.labels) ||
            (Arr.isEmpty(task.labels)
              ? chosen.labels.includes(undefined)
              : task.labels.some((label) => chosen.labels.includes(label)))),
      )
      .map(({ id }) => nodeId({ kind: 'task', id }))
      .filter((id) => !hidden.has(id)),
  );

  const sources = buildSourceIds(state);

  const dependents = buildDependentIds(state);

  const neighborsOf = (id: GraphNodeId): readonly GraphNodeId[] =>
    Arr.concat(sources.get(id) ?? [], dependents.get(id) ?? []);

  const keptMilestones = state.milestones
    .filter((milestone) => inGroupChosen(milestone.groupId))
    .map(({ id }) => nodeId({ kind: 'milestone', id }))
    .filter(
      (id) =>
        !hidden.has(id) &&
        (Arr.isEmpty(chosen.labels) ||
          neighborsOf(id).some((neighbor) => keptTasks.has(neighbor))),
    );

  const kept: ReadonlySet<GraphNodeId> = new Set(
    Arr.concat(Array.from(keptTasks), keptMilestones),
  );

  const outside: ReadonlySet<GraphNodeId> = new Set(
    Array.from(kept)
      .flatMap(neighborsOf)
      .filter((id) => !kept.has(id) && !hidden.has(id)),
  );

  return {
    hidden: new Set(
      Array.from(sources.keys()).filter(
        (id) => !kept.has(id) && !outside.has(id),
      ),
    ),
    outside,
  } as const;
};

/**
 * Every label on a task, once each, in order: what the filter offers to choose
 * from.
 */
export const taskLabels = (state: DomainState): readonly string[] =>
  Arr.uniq(state.tasks.flatMap(({ labels }) => labels)).toSorted((a, b) =>
    a.localeCompare(b),
  );

/** `filter` without the groups that do not exist, nor the labels on no task. */
const knownChoices = (
  state: DomainState,
  groups: readonly Group[],
  filter: DagFilter,
): DagFilter => {
  const groupIds = new Set(groups.map(({ id }) => id));

  const labels = new Set(taskLabels(state));

  return {
    groups: filter.groups.filter((id) => id === undefined || groupIds.has(id)),
    labels: filter.labels.filter(
      (label) => label === undefined || labels.has(label),
    ),
  } as const;
};
