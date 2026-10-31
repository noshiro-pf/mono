import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { withLabelsAdded } from './labels.mjs';
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
 * the progress (as `setProgress` sets it) and the labels of the tasks among
 * them, and the group of every one. A milestone has no progress and no labels,
 * and only its group changes. Only the nodes that change are returned, each
 * once; a node that is gone is left out.
 */
export const editNodes = (
  state: DomainState,
  refs: readonly NodeRef[],
  edit: NodeEdit,
  now: number,
): EditNodesResult => {
  const taskIds = new Set(
    Arr.generate(function* () {
      for (const ref of refs) {
        if (ref.kind === 'task') {
          yield ref.id;
        }
      }
    }),
  );

  const milestoneIds = new Set(
    Arr.generate(function* () {
      for (const ref of refs) {
        if (ref.kind === 'milestone') {
          yield ref.id;
        }
      }
    }),
  );

  return {
    updatedTasks: Arr.generate(function* () {
      for (const task of state.tasks) {
        if (!taskIds.has(task.id)) {
          continue;
        }

        const edited = editTask(task, edit, now);

        if (edited !== task) {
          yield edited;
        }
      }
    }),
    updatedMilestones: Arr.generate(function* () {
      for (const milestone of state.milestones) {
        if (
          milestoneIds.has(milestone.id) &&
          edit.group !== undefined &&
          milestone.groupId !== edit.group.to
        ) {
          yield { ...milestone, groupId: edit.group.to, updatedAt: now };
        }
      }
    }),
  };
};

/** What {@link editNodes} changes; {@link NO_NODE_EDIT} changes nothing. */
export type NodeEdit = DeepReadonly<{
  /** The progress of every task; `undefined` leaves each as it is. */
  progress: Progress | undefined;
  /**
   * Given to every task that lacks them, after those it has; not one it has in
   * another case or width (`sameLabel`).
   */
  addLabels: string[];
  /**
   * Taken off every task that has them, spelled as it has them — unless also in
   * `addLabels`, which wins. Taking a label off and adding it in another case
   * changes its case.
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

  const labels = withLabelsAdded(Arr.uniq(kept), edit.addLabels);

  const groupId = edit.group === undefined ? task.groupId : edit.group.to;

  const labelsChanged =
    labels.length !== task.labels.length ||
    labels.some((label, index) => label !== task.labels[index]);

  return progressed === task && !labelsChanged && groupId === task.groupId
    ? task
    : { ...progressed, labels, groupId, updatedAt: now };
};
