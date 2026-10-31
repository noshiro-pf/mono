import { Arr } from 'ts-data-forge';
import type { Cells } from '../scenario.mjs';

/**
 * The project schedule every implementation under this directory renders: a
 * critical-path calculation over tasks that depend on earlier tasks.
 *
 * Each task starts when the last of its predecessors finishes (the forward
 * pass), must finish before the first of its successors has to start (the
 * backward pass, from the end of the project), and its slack is the difference.
 * A task depends on several predecessors, and the end of the project on every
 * task that nothing depends on, so the derived values form diamonds of every
 * length: a task's slack joins the forward pass at its own depth with the
 * backward pass that came back from the end of the whole project.
 *
 * Each task's duration is an input of its own, as a schedule whose rows can be
 * edited has. The signal-based implementations make one derived value per
 * figure, so that the graph is as large as the calculation; React and Preact
 * compute the figures in a loop when they render.
 */
export type ScheduleApp = Readonly<{
  setDuration: (task: number, days: number) => void;
  dispose: () => void;
}>;

export type Task = Readonly<{
  id: number;
  duration: number;
  /** Indices of earlier tasks. */
  predecessors: readonly number[];
}>;

export const taskCount = 1000;

/**
 * Builds `count` tasks. Each task after the first depends on one to three of
 * the twenty before it, and lasts one to ten days. The generator is seeded, so
 * every implementation is given the same project.
 */
export const createTasks = (count: number): readonly Task[] => {
  const mut_state = { seed: 7 };

  const random = (max: number): number => {
    // xorshift32, as in `data.mts`.
    let mut_x = mut_state.seed;

    mut_x ^= mut_x << 13;

    mut_x ^= mut_x >>> 17;

    mut_x ^= mut_x << 5;

    mut_state.seed = mut_x >>> 0;

    return mut_state.seed % max;
  };

  return Array.from({ length: count }, (_, id) => {
    const duration = 1 + random(10);

    if (id === 0) {
      return { id, duration, predecessors: [] };
    }

    const window = Math.min(id, 20);

    const predecessors = new Set(
      Array.from({ length: 1 + random(3) }, () => id - 1 - random(window)),
    );

    return {
      id,
      duration,
      predecessors: Array.from(predecessors).toSorted((a, b) => a - b),
    };
  });
};

export const tasks: readonly Task[] = createTasks(taskCount);

export const initialDurations: readonly number[] = tasks.map(
  (task) => task.duration,
);

/** The indices of the tasks that depend on each task. */
export const successors: readonly (readonly number[])[] = (() => {
  const mut_successors: number[][] = tasks.map(() => []);

  for (const task of tasks) {
    for (const p of task.predecessors) {
      mut_successors[p]?.push(task.id);
    }
  }

  return mut_successors;
})();

/** The tasks nothing depends on: the end of the project waits for them. */
export const lastTasks: readonly number[] = tasks
  .filter((task) => successors[task.id]?.length === 0)
  .map((task) => task.id);

/**
 * How many tasks are shown: the last ones, as a table scrolled to the end
 * would. The rest are computed and not displayed, so that the DOM does not hide
 * the cost of the calculation.
 */
export const shownCount = 50;

/** The indices of the tasks shown, in order. */
export const shownTasks: readonly number[] = Array.from(
  { length: shownCount },
  (_, i) => taskCount - shownCount + i,
);

/** The largest of `values`, or `empty` when there are none. */
export const maxOf = (values: readonly number[], empty: number): number =>
  Arr.isEmpty(values) ? empty : Math.max(...values);

/** The smallest of `values`, or `empty` when there are none. */
export const minOf = (values: readonly number[], empty: number): number =>
  Arr.isEmpty(values) ? empty : Math.min(...values);

export const countZeros = (values: readonly number[]): number =>
  values.filter((value) => value === 0).length;

/** The cells of the summary row: the end of the project, critical tasks. */
export const scheduleSummaryCells = (
  projectEnd: number,
  criticalCount: number,
): readonly string[] =>
  [projectEnd.toString(), criticalCount.toString()] as const;

/** The cells of a task's row: its number, start, finish and slack. */
export const taskCells = (
  task: number,
  earlyStart: number,
  earlyFinish: number,
  slack: number,
): readonly string[] =>
  [
    (task + 1).toString(),
    earlyStart.toString(),
    earlyFinish.toString(),
    slack.toString(),
  ] as const;

/**
 * Every figure, computed in one loop over the tasks in order and one in
 * reverse: what React and Preact do when they render, and what the harness
 * checks the others against.
 */
export const computeSchedule = (durations: readonly number[]): Cells => {
  const mut_earlyFinish: number[] = [];

  const earlyStart = tasks.map((task) => {
    const start = maxOf(
      task.predecessors.map((p) => mut_earlyFinish[p] ?? 0),
      0,
    );

    mut_earlyFinish.push(start + (durations[task.id] ?? 0));

    return start;
  });

  const projectEnd = maxOf(
    lastTasks.map((task) => mut_earlyFinish[task] ?? 0),
    0,
  );

  const mut_lateStart: number[] = Array.from(tasks, () => 0);

  for (const task of tasks.toReversed()) {
    const lateFinish = minOf(
      (successors[task.id] ?? []).map((s) => mut_lateStart[s] ?? 0),
      projectEnd,
    );

    mut_lateStart[task.id] = lateFinish - (durations[task.id] ?? 0);
  }

  const slack = tasks.map(
    (task) => (mut_lateStart[task.id] ?? 0) - (earlyStart[task.id] ?? 0),
  );

  return Arr.toUnshifted(scheduleSummaryCells(projectEnd, countZeros(slack)))(
    shownTasks.map((task) =>
      taskCells(
        task,
        earlyStart[task] ?? 0,
        mut_earlyFinish[task] ?? 0,
        slack[task] ?? 0,
      ),
    ),
  );
};
