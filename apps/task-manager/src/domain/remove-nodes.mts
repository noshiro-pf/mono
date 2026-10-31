import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { nodeId } from './graph-nodes.mjs';
import type {
  Dependency,
  DomainState,
  Milestone,
  NodeRef,
  Task,
} from './types.mjs';

/**
 * `state` without the nodes `refs`, and without every dependency on any of them
 * — what deleting nodes has to write in one go, so that no other node is left
 * waiting for something that no longer exists (a dependency on a missing node
 * never holds).
 *
 * `updatedTasks` and `updatedMilestones` are the nodes kept whose dependencies
 * changed, with `updatedAt` set to `now`; the other nodes are returned as they
 * were. A node that does not exist is still cleaned out of the dependencies
 * that name it.
 */
export const removeNodes = (
  state: DomainState,
  refs: readonly NodeRef[],
  now: number,
): RemoveNodesResult => {
  const removedIds = new Set(refs.map(nodeId));

  const dependsOnRemoved = (dependency: Dependency): boolean =>
    removedIds.has(nodeId(dependency.from));

  /** `dependencies` without those on the node, or `undefined` if none was. */
  const remaining = (
    dependencies: readonly Dependency[],
  ): readonly Dependency[] | undefined =>
    dependencies.some(dependsOnRemoved)
      ? dependencies.filter((dependency) => !dependsOnRemoved(dependency))
      : undefined;

  const tasks = state.tasks
    .filter((task) => !removedIds.has(nodeId({ kind: 'task', id: task.id })))
    .map((task) => {
      const dependencies = remaining(task.dependencies);

      return {
        task,
        updated:
          dependencies === undefined
            ? undefined
            : { ...task, dependencies, updatedAt: now },
      };
    });

  const milestones = state.milestones
    .filter(
      (milestone) =>
        !removedIds.has(nodeId({ kind: 'milestone', id: milestone.id })),
    )
    .map((milestone) => {
      const dependencies = remaining(milestone.dependencies);

      return {
        milestone,
        updated:
          dependencies === undefined
            ? undefined
            : { ...milestone, dependencies, updatedAt: now },
      };
    });

  return {
    state: {
      tasks: tasks.map(({ task, updated }) => updated ?? task),
      milestones: milestones.map(
        ({ milestone, updated }) => updated ?? milestone,
      ),
    },
    updatedTasks: Arr.generate(function* () {
      for (const { updated } of tasks) {
        if (updated !== undefined) {
          yield updated;
        }
      }
    }),
    updatedMilestones: Arr.generate(function* () {
      for (const { updated } of milestones) {
        if (updated !== undefined) {
          yield updated;
        }
      }
    }),
  };
};

export type RemoveNodesResult = DeepReadonly<{
  state: DomainState;
  updatedTasks: Task[];
  updatedMilestones: Milestone[];
}>;
