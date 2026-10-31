import type { UpdatedNode } from './add-dependency.mjs';
import { nodeId } from './graph-nodes.mjs';
import type { Dependency, DomainState, NodeRef } from './types.mjs';

/**
 * `dependent` as stored, with every dependency on `source` taken out at `now` —
 * the one edge the DAG draws between them, however many rows of the dialog it
 * stands for — and the rest kept in their order; `undefined` when there is no
 * such node or it does not depend on `source`.
 */
export const removeDependency = (
  state: DomainState,
  dependent: NodeRef,
  source: NodeRef,
  now: number,
): UpdatedNode | undefined => {
  const sourceId = nodeId(source);

  /** `dependencies` without those on `source`, or `undefined` if none was. */
  const remaining = (
    dependencies: readonly Dependency[],
  ): readonly Dependency[] | undefined => {
    const rest = dependencies.filter(({ from }) => nodeId(from) !== sourceId);

    return rest.length === dependencies.length ? undefined : rest;
  };

  if (dependent.kind === 'task') {
    const task = state.tasks.find(({ id }) => id === dependent.id);

    const left = task === undefined ? undefined : remaining(task.dependencies);

    return task === undefined || left === undefined
      ? undefined
      : { kind: 'task', task: { ...task, dependencies: left, updatedAt: now } };
  }

  const milestone = state.milestones.find(({ id }) => id === dependent.id);

  const kept =
    milestone === undefined ? undefined : remaining(milestone.dependencies);

  return milestone === undefined || kept === undefined
    ? undefined
    : {
        kind: 'milestone',
        milestone: { ...milestone, dependencies: kept, updatedAt: now },
      };
};
