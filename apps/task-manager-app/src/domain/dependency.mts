/**
 * One-off questions about dependencies. Each builds its own evaluator; to
 * ask many questions about one state at one time, use `createEvaluator`.
 */

import { Arr } from 'ts-data-forge';
import type { EvaluationContext } from './evaluation-context.mjs';
import { createEvaluator } from './evaluator.mjs';
import type { Dependency, Milestone, Task } from './types.mjs';

/** From when `dependency` holds, or `undefined` if it does not at `now`. */
export const satisfiedSince = (
  dependency: Dependency,
  context: EvaluationContext,
  now: number,
): number | undefined =>
  createEvaluator(context, now).satisfiedSince(dependency);

export const unmetDependencies = (
  task: Task,
  context: EvaluationContext,
  now: number,
): readonly Dependency[] => {
  const evaluator = createEvaluator(context, now);

  return task.dependencies.filter(
    (dependency) => evaluator.satisfiedSince(dependency) === undefined,
  );
};

/** Whether every dependency of `task` holds at `now`. */
export const isActionable = (
  task: Task,
  context: EvaluationContext,
  now: number,
): boolean => !Arr.isNonEmpty(unmetDependencies(task, context, now));

/** When `milestone` was reached, or `undefined` if it has not been by `now`. */
export const milestoneReachedAt = (
  milestone: Milestone,
  context: EvaluationContext,
  now: number,
): number | undefined =>
  createEvaluator(context, now).milestoneReachedAt(milestone);

export const isMilestoneReached = (
  milestone: Milestone,
  context: EvaluationContext,
  now: number,
): boolean => milestoneReachedAt(milestone, context, now) !== undefined;
