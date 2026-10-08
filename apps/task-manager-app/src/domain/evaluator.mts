/**
 * Evaluates dependencies on the current state: a dependency holds from the
 * time its source got where it waits for — as the source is now, not as it
 * once was — plus its lag.
 *
 * - On a task, `finish-to-start` waits for the task to be `done` (from its
 *   `completedAt`), and `start-to-start` for it to be past `not-started`
 *   (from its `startedAt`). `setProgress` keeps both timestamps in step with
 *   the progress.
 * - On a milestone, it waits for the milestone to be reached.
 * - On a node that does not exist, it never holds.
 */

import { Arr } from 'ts-data-forge';
import { type EvaluationContext } from './evaluation-context.mjs';
import {
  isTaskDependency,
  type Dependency,
  type Milestone,
  type MilestoneId,
  type Task,
} from './types.mjs';

/**
 * An evaluator for one state at one time. Milestones are evaluated at most
 * once each per evaluator, so evaluating many dependencies through one
 * evaluator shares the work. A milestone on a dependency cycle is never
 * reached.
 */
export const createEvaluator = (
  context: EvaluationContext,
  now: number,
): Evaluator => {
  const mut_memo = new Map<MilestoneId, MemoEntry>();

  const sourceEventAt = (dependency: Dependency): number | undefined => {
    if (isTaskDependency(dependency)) {
      const task = context.tasksById.get(dependency.from.id);

      return task === undefined
        ? undefined
        : dependency.type === 'finish-to-start'
          ? completedAt(task)
          : startedAt(task);
    }

    const milestone = context.milestonesById.get(dependency.from.id);

    return milestone === undefined ? undefined : milestoneReachedAt(milestone);
  };

  const satisfiedSince = (dependency: Dependency): number | undefined => {
    const eventAt = sourceEventAt(dependency);

    if (eventAt === undefined) {
      return undefined;
    }

    const since = eventAt + dependency.lagMs;

    return since <= now ? since : undefined;
  };

  const milestoneReachedAt = (milestone: Milestone): number | undefined => {
    const memo = mut_memo.get(milestone.id);

    if (memo !== undefined) {
      return memo === 'evaluating' ? undefined : memo.reachedAt;
    }

    mut_memo.set(milestone.id, 'evaluating');

    const reachedAt = evaluateMilestone(milestone);

    mut_memo.set(milestone.id, { reachedAt });

    return reachedAt;
  };

  const evaluateMilestone = (milestone: Milestone): number | undefined => {
    const components = [
      ...(milestone.date === undefined
        ? ([] as const)
        : ([milestone.date] as const)),
      ...(milestone.requiresManualCheck
        ? ([milestone.checkedAt] as const)
        : ([] as const)),
      ...milestone.dependencies.map(satisfiedSince),
    ] as const;

    if (!Arr.isNonEmpty(components)) {
      return milestone.createdAt;
    }

    const reached = components.filter(
      (at): at is number => at !== undefined && at <= now,
    );

    return Arr.isNonEmpty(reached) && reached.length === components.length
      ? Math.max(...reached)
      : undefined;
  };

  return { sourceEventAt, satisfiedSince, milestoneReachedAt };
};

export type Evaluator = Readonly<{
  /**
   * When the source of `dependency` got where it waits for (before the lag),
   * or `undefined` if it has not.
   */
  sourceEventAt: (dependency: Dependency) => number | undefined;
  /**
   * From when `dependency` holds, or `undefined` if it does not hold at
   * `now`.
   */
  satisfiedSince: (dependency: Dependency) => number | undefined;
  /**
   * When `milestone` was reached — the latest of its date, its check and its
   * dependencies, each of which must have happened by `now`; its
   * `createdAt` if it has none of them — or `undefined` if it has not been.
   */
  milestoneReachedAt: (milestone: Milestone) => number | undefined;
}>;

type MemoEntry = 'evaluating' | Readonly<{ reachedAt: number | undefined }>;

const completedAt = (task: Task): number | undefined =>
  task.progress === 'done' ? task.completedAt : undefined;

const startedAt = (task: Task): number | undefined =>
  task.progress === 'not-started' ? undefined : task.startedAt;
