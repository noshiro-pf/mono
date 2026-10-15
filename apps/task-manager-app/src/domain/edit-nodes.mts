import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { setProgress } from './set-progress.mjs';
import type {
  DomainState,
  GroupId,
  Milestone,
  NodeRef,
  Progress,
  Task,
} from './types.mjs';

/**
 * The nodes `refs` of `state` with `edit` made to each, all stamped `now`:
 * the progress (as `setProgress` sets it) and the labels of the tasks
 * among them, and the group of every one. A milestone has no progress and
 * no labels, and only its group changes. Only the nodes that change are
 * returned, each once; a node that is gone is left out.
 */
export const editNodes = (
  state: DomainState,
  refs: readonly NodeRef[],
  edit: NodeEdit,
  now: number,
): EditNodesResult => {
  const taskIds = new Set(
    refs.flatMap((ref) => (ref.kind === 'task' ? [ref.id] : [])),
  );

  const milestoneIds = new Set(
    refs.flatMap((ref) => (ref.kind === 'milestone' ? [ref.id] : [])),
  );

  return {
    updatedTasks: state.tasks
      .filter(({ id }) => taskIds.has(id))
      .flatMap((task) => {
        const edited = editTask(task, edit, now);

        return edited === task ? [] : [edited];
      }),
    updatedMilestones: state.milestones
      .filter(({ id }) => milestoneIds.has(id))
      .flatMap((milestone) =>
        edit.group === undefined || milestone.groupId === edit.group.to
          ? []
          : [{ ...milestone, groupId: edit.group.to, updatedAt: now }],
      ),
  };
};

/** What {@link editNodes} changes; {@link NO_NODE_EDIT} changes nothing. */
export type NodeEdit = DeepReadonly<{
  /** The progress of every task; `undefined` leaves each as it is. */
  progress: Progress | undefined;
  /** Given to every task that lacks them, after those it has. */
  addLabels: string[];
  /**
   * Taken off every task that has them — unless also in `addLabels`, which
   * wins.
   */
  removeLabels: string[];
  /** The group of every node, `to` none or a group; `undefined` leaves it. */
  group: { to: GroupId | undefined } | undefined;
}>;

export type EditNodesResult = DeepReadonly<{
  updatedTasks: Task[];
  updatedMilestones: Milestone[];
}>;

export const NO_NODE_EDIT: NodeEdit = {
  progress: undefined,
  addLabels: [],
  removeLabels: [],
  group: undefined,
} as const;

/** `task` with `edit` made to it, or `task` itself if nothing changes. */
const editTask = (task: Task, edit: NodeEdit, now: number): Task => {
  const progressed =
    edit.progress === undefined ? task : setProgress(task, edit.progress, now);

  const kept = progressed.labels.filter(
    (label) =>
      !edit.removeLabels.includes(label) || edit.addLabels.includes(label),
  );

  const labels = Arr.uniq([...kept, ...edit.addLabels]);

  const groupId = edit.group === undefined ? task.groupId : edit.group.to;

  const labelsChanged =
    labels.length !== task.labels.length ||
    labels.some((label, index) => label !== task.labels[index]);

  return progressed === task && !labelsChanged && groupId === task.groupId
    ? task
    : { ...progressed, labels, groupId, updatedAt: now };
};
