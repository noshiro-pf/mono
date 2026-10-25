import { initialDurations, type ScheduleApp } from './model.mjs';

/**
 * The durations as one immutable array, for the virtual-DOM libraries: each
 * change computes the next array from the last and hands it to `commit`,
 * which re-renders. React and Preact share it, so that they differ only in
 * how they render.
 */
export const createScheduleOperations = (
  commit: (durations: readonly number[]) => void,
  dispose: () => void,
): ScheduleApp => {
  const mut_current: { durations: readonly number[] } = {
    durations: initialDurations,
  };

  return {
    setDuration: (task, days) => {
      mut_current.durations = mut_current.durations.with(task, days);

      commit(mut_current.durations);
    },
    dispose,
  };
};
