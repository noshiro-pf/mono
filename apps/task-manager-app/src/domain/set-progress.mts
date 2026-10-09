import { type Progress, type Task } from './types.mjs';

/**
 * `task` moved to `progress` at `now`, with `startedAt` and `completedAt`
 * kept describing the current progress — dependencies are evaluated on it:
 *
 * - Starting (leaving `not-started`) sets `startedAt`; moving among the
 *   started progresses keeps it.
 * - Entering `done` sets `completedAt`; leaving `done` clears it.
 * - Going back to `not-started` clears both.
 *
 * `updatedAt` becomes `now`. Setting the progress a task already has returns
 * the task as it is.
 */
export const setProgress = (
  task: Task,
  progress: Progress,
  now: number,
): Task => {
  if (task.progress === progress) {
    return task;
  }

  const startedAt =
    progress === 'not-started'
      ? undefined
      : task.progress === 'not-started'
        ? now
        : (task.startedAt ?? now);

  return {
    ...task,
    progress,
    startedAt,
    completedAt: progress === 'done' ? now : undefined,
    updatedAt: now,
  };
};
