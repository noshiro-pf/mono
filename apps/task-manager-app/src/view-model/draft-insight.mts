/**
 * What a dialog shows about the node as drafted — its status, the
 * dependencies that do not hold — so that adding a dependency or changing
 * the progress shows its effect before it is saved. The dependencies are
 * those the dialog's rows would save (`validDependencies`).
 */

import { Result } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import {
  buildEvaluationContext,
  createEvaluator,
  createMilestone,
  createTask,
  displayStatus,
  isStartedWithUnmetDependencies,
  unmetDependencies,
  type Dependency,
  type DisplayStatus,
  type DomainState,
  type Milestone,
  type MilestoneId,
  type Progress,
  type Task,
  type TaskId,
} from '../domain/index.mjs';
import { optionalDateTime } from './task-draft.mjs';

export const taskDraftInsight = (
  state: DomainState,
  id: TaskId,
  draft: DeepReadonly<{
    progress: Progress;
    dependencies: readonly Dependency[];
  }>,
  now: number,
): TaskDraftInsight => {
  const stored =
    state.tasks.find((task) => task.id === id) ??
    createTask({ id, title: '', now });

  // The start time is kept from the stored task; a task drafted into
  // progress has not started yet, but is evaluated as if it had.
  const drafted: Task = {
    ...stored,
    progress: draft.progress,
    startedAt:
      draft.progress === 'not-started' ? undefined : (stored.startedAt ?? now),
    dependencies: draft.dependencies,
  };

  const context = buildEvaluationContext(state);

  return {
    status: displayStatus(drafted, context, now),
    startedWithUnmetDependencies: isStartedWithUnmetDependencies(
      drafted,
      context,
      now,
    ),
    unmet: unmetDependencies(drafted, context, now),
  };
};

export const milestoneDraftInsight = (
  state: DomainState,
  id: MilestoneId,
  draft: DeepReadonly<{
    date: string;
    requiresManualCheck: boolean;
    checkedAt: number | undefined;
    dependencies: readonly Dependency[];
  }>,
  now: number,
  timeZone?: string,
): MilestoneDraftInsight => {
  const stored =
    state.milestones.find((milestone) => milestone.id === id) ??
    createMilestone({ id, title: '', now });

  const date = optionalDateTime(draft.date, timeZone);

  // A date still being typed counts as none until it is a date.
  const drafted: Milestone = {
    ...stored,
    date: Result.isOk(date) ? date.value : undefined,
    requiresManualCheck: draft.requiresManualCheck,
    checkedAt: draft.checkedAt,
    dependencies: draft.dependencies,
  };

  const evaluator = createEvaluator(buildEvaluationContext(state), now);

  return {
    reachedAt: evaluator.milestoneReachedAt(drafted),
    waitingForDate:
      drafted.date !== undefined && drafted.date > now
        ? drafted.date
        : undefined,
    waitingForCheck:
      drafted.requiresManualCheck &&
      (drafted.checkedAt === undefined || drafted.checkedAt > now),
    unmet: drafted.dependencies.filter(
      (dependency) => evaluator.satisfiedSince(dependency) === undefined,
    ),
  };
};

export type TaskDraftInsight = DeepReadonly<{
  status: DisplayStatus;
  startedWithUnmetDependencies: boolean;
  unmet: Dependency[];
}>;

export type MilestoneDraftInsight = DeepReadonly<{
  reachedAt: number | undefined;
  /** The date of the milestone while it is still ahead. */
  waitingForDate: number | undefined;
  /** Whether a manual check is required and not resolved. */
  waitingForCheck: boolean;
  /** The dependencies that do not hold. */
  unmet: Dependency[];
}>;
