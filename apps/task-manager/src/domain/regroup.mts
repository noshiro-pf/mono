import type { DeepReadonly } from 'ts-type-forge';
import type {
  DomainState,
  GroupId,
  Milestone,
  NodeRef,
  Task,
} from './types.mjs';

/**
 * The node `ref` of `state` moved into the group `groupId`, or into none,
 * with `updatedAt` set to `now`; `undefined` if there is no such node, or
 * it is in that group already.
 */
export const regroupNode = (
  state: DomainState,
  ref: NodeRef,
  groupId: GroupId | undefined,
  now: number,
): RegroupedNode | undefined => {
  if (ref.kind === 'task') {
    const task = state.tasks.find(({ id }) => id === ref.id);

    return task === undefined || task.groupId === groupId
      ? undefined
      : { kind: 'task', task: { ...task, groupId, updatedAt: now } };
  }

  const milestone = state.milestones.find(({ id }) => id === ref.id);

  return milestone === undefined || milestone.groupId === groupId
    ? undefined
    : {
        kind: 'milestone',
        milestone: { ...milestone, groupId, updatedAt: now },
      };
};

/**
 * What deleting the group `groupId` has to write with it: every node of
 * `state` that was in it, now in none, with `updatedAt` set to `now`. The
 * nodes stay; only the group goes.
 */
export const removeGroup = (
  state: DomainState,
  groupId: GroupId,
  now: number,
): RemoveGroupResult =>
  ({
    updatedTasks: state.tasks
      .filter((task) => task.groupId === groupId)
      .map((task) => ({ ...task, groupId: undefined, updatedAt: now })),
    updatedMilestones: state.milestones
      .filter((milestone) => milestone.groupId === groupId)
      .map((milestone) => ({
        ...milestone,
        groupId: undefined,
        updatedAt: now,
      })),
  }) as const;

export type RegroupedNode = DeepReadonly<
  { kind: 'task'; task: Task } | { kind: 'milestone'; milestone: Milestone }
>;

export type RemoveGroupResult = DeepReadonly<{
  updatedTasks: Task[];
  updatedMilestones: Milestone[];
}>;
