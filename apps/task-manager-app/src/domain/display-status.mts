import { isActionable } from './dependency.mjs';
import { type EvaluationContext } from './evaluation-context.mjs';
import { type DisplayStatus, type Task } from './types.mjs';

/**
 * The status `task` is shown with at `now`: `ready` or `blocked` for a task
 * that has not started, depending on whether all its dependencies hold, and
 * its progress otherwise.
 */
export const displayStatus = (
  task: Task,
  context: EvaluationContext,
  now: number,
): DisplayStatus =>
  task.progress !== 'not-started'
    ? task.progress
    : isActionable(task, context, now)
      ? 'ready'
      : 'blocked';

/**
 * Whether `task` is being worked on (`in-progress` or `in-review`) while one
 * of its dependencies does not hold — started early, or a source reopened or
 * a dependency added since. A UI shows a warning for it.
 */
export const isStartedWithUnmetDependencies = (
  task: Task,
  context: EvaluationContext,
  now: number,
): boolean =>
  (task.progress === 'in-progress' || task.progress === 'in-review') &&
  !isActionable(task, context, now);
