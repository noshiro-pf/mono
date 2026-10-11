/**
 * What the list shows for each task and milestone at a time: the stored
 * record with what is derived from it — its status, the warnings — sorted
 * and filtered as the settings say. Computed whole, from the state and the
 * clock, so a component only draws.
 */

import type { DeepReadonly } from 'ts-type-forge';
import {
  buildEvaluationContext,
  createEvaluator,
  isStartedWithUnmetDependencies,
  sortTasks,
  taskSortContext,
  type DisplayStatus,
  type DomainState,
  type Milestone,
  type Task,
} from '../domain/index.mjs';
import type { ListSettings } from './list-settings.mjs';

export const buildTaskRows = (
  state: DomainState,
  now: number,
  settings: ListSettings,
): readonly TaskRow[] => {
  const context = buildEvaluationContext(state);

  const sortContext = taskSortContext(state, now);

  const { displayStatusById, depthById } = sortContext;

  const shown = settings.hideDone
    ? state.tasks.filter((task) => task.progress !== 'done')
    : state.tasks;

  return sortTasks(shown, settings.sort, sortContext).map((task) => ({
    task,
    status: displayStatusById.get(task.id) ?? 'blocked',
    startedWithUnmetDependencies: isStartedWithUnmetDependencies(
      task,
      context,
      now,
    ),
    overdue:
      task.progress !== 'done' &&
      task.dueDate !== undefined &&
      task.dueDate < now,
    depth: depthById?.get(task.id),
  }));
};

/** Every milestone, by date (those without one last), then by title. */
export const buildMilestoneRows = (
  state: DomainState,
  now: number,
): readonly MilestoneRow[] => {
  const evaluator = createEvaluator(buildEvaluationContext(state), now);

  const collator = new Intl.Collator('ja');

  return state.milestones
    .toSorted((x, y) => {
      const byDate =
        (x.date ?? Number.POSITIVE_INFINITY) -
        (y.date ?? Number.POSITIVE_INFINITY);

      return byDate === 0 || Number.isNaN(byDate)
        ? collator.compare(x.title, y.title)
        : byDate;
    })
    .map((milestone) => ({
      milestone,
      reachedAt: evaluator.milestoneReachedAt(milestone),
      awaitingCheck:
        milestone.requiresManualCheck && milestone.checkedAt === undefined,
    }));
};

export type TaskRow = DeepReadonly<{
  task: Task;
  status: DisplayStatus;
  /** Being worked on while a dependency does not hold: shown as a warning. */
  startedWithUnmetDependencies: boolean;
  /** Past its due date and not done. */
  overdue: boolean;
  /** `undefined` when the graph has a cycle, and depth means nothing. */
  depth: number | undefined;
}>;

export type MilestoneRow = DeepReadonly<{
  milestone: Milestone;
  /** `undefined` while it has not been reached. */
  reachedAt: number | undefined;
  /** Needs its manual check and has not had it. */
  awaitingCheck: boolean;
}>;
