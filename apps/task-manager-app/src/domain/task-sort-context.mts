import { Result } from 'ts-data-forge';
import { dependencyDepth } from './dependency-depth.mjs';
import { displayStatus } from './display-status.mjs';
import { buildEvaluationContext } from './evaluation-context.mjs';
import { type SortContext } from './sort-tasks.mjs';
import { type DisplayStatus, type DomainState, type TaskId } from './types.mjs';

/**
 * What `sortTasks` needs to sort the tasks of `state` by status and by
 * depth, at `now`: every task's display status, and every task's dependency
 * depth over the whole state — none with a cycle, where depth means nothing.
 * One place for the list and the diagrams, so that they agree.
 */
export const taskSortContext = (
  state: DomainState,
  now: number,
): TaskSortContext => {
  const context = buildEvaluationContext(state);

  const depth = dependencyDepth(state);

  return {
    displayStatusById: new Map(
      state.tasks.map((task) => [task.id, displayStatus(task, context, now)]),
    ),
    depthById: Result.isOk(depth) ? depth.value.tasks : undefined,
  };
};

export type TaskSortContext = SortContext &
  Readonly<{
    displayStatusById: ReadonlyMap<TaskId, DisplayStatus>;
    depthById: ReadonlyMap<TaskId, number> | undefined;
  }>;
