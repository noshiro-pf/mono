import { type DeepReadonly } from 'ts-type-forge';
import { nodeId } from './graph-nodes.mjs';
import {
  type Dependency,
  type DomainState,
  type Milestone,
  type NodeRef,
  type Task,
} from './types.mjs';

/**
 * `state` without the node `ref`, and without every dependency on it — what
 * deleting a node has to write in one go, so that no other node is left
 * waiting for something that no longer exists (a dependency on a missing
 * node never holds).
 *
 * `updatedTasks` and `updatedMilestones` are the nodes whose dependencies
 * changed, with `updatedAt` set to `now`; the other nodes are returned as
 * they were. A node that does not exist is still cleaned out of the
 * dependencies that name it.
 */
export const removeNode = (
  state: DomainState,
  ref: NodeRef,
  now: number,
): RemoveNodeResult => {
  const removedId = nodeId(ref);

  const dependsOnRemoved = (dependency: Dependency): boolean =>
    nodeId(dependency.from) === removedId;

  /** `dependencies` without those on the node, or `undefined` if none was. */
  const remaining = (
    dependencies: readonly Dependency[],
  ): readonly Dependency[] | undefined =>
    dependencies.some(dependsOnRemoved)
      ? dependencies.filter((dependency) => !dependsOnRemoved(dependency))
      : undefined;

  const tasks = state.tasks
    .filter((task) => nodeId({ kind: 'task', id: task.id }) !== removedId)
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
        nodeId({ kind: 'milestone', id: milestone.id }) !== removedId,
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
    updatedTasks: tasks.flatMap(({ updated }) =>
      updated === undefined ? [] : [updated],
    ),
    updatedMilestones: milestones.flatMap(({ updated }) =>
      updated === undefined ? [] : [updated],
    ),
  };
};

export type RemoveNodeResult = DeepReadonly<{
  state: DomainState;
  updatedTasks: Task[];
  updatedMilestones: Milestone[];
}>;
