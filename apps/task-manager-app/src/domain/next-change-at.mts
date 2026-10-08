import { Arr } from 'ts-data-forge';
import { buildEvaluationContext } from './evaluation-context.mjs';
import { createEvaluator } from './evaluator.mjs';
import { type DomainState } from './types.mjs';

/**
 * The earliest time after `now` at which a dependency or a milestone changes
 * by the passage of time alone — a lag running after an event that has
 * happened, a milestone date still to come — or `undefined` when nothing
 * will. A UI re-renders at that time and asks again: whatever that change
 * sets off comes after it.
 */
export const nextChangeAt = (
  state: DomainState,
  now: number,
): number | undefined => {
  const evaluator = createEvaluator(buildEvaluationContext(state), now);

  const lagEnds = [...state.tasks, ...state.milestones].flatMap(
    ({ dependencies }) =>
      dependencies.map((dependency) => {
        const eventAt = evaluator.sourceEventAt(dependency);

        return eventAt === undefined ? undefined : eventAt + dependency.lagMs;
      }),
  );

  const milestoneTimes = state.milestones.flatMap((milestone) => [
    milestone.date,
    milestone.requiresManualCheck ? milestone.checkedAt : undefined,
  ]);

  const upcoming = [...lagEnds, ...milestoneTimes].filter(
    (at): at is number => at !== undefined && at > now,
  );

  return Arr.isNonEmpty(upcoming) ? Math.min(...upcoming) : undefined;
};
