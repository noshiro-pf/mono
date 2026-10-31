import { Arr } from 'ts-data-forge';
import van, { type State } from 'vanjs-core';
import type { ScenarioFramework } from '../scenario.mjs';
import {
  countZeros,
  initialDurations,
  lastTasks,
  maxOf,
  minOf,
  shownTasks,
  successors,
  tasks,
  type ScheduleApp,
} from './model.mjs';

const { table, tbody, td, tr } = van.tags;

/**
 * Each duration is a state, and every figure is a `van.derive` of its own,
 * reading the figures it is computed from. The cells are bound to the figures.
 */
export const vanjsSchedule: ScenarioFramework<ScheduleApp> = {
  name: 'VanJS',
  mount: (container) => {
    const zero = van.state(0);

    const durations = initialDurations.map((days) => van.state(days));

    const mut_earlyStart: State<number>[] = [];

    const mut_earlyFinish: State<number>[] = [];

    for (const task of tasks) {
      const duration = durations[task.id] ?? zero;

      const finishes = task.predecessors.flatMap(
        (p) => mut_earlyFinish[p] ?? [],
      );

      const earlyStart = Arr.isEmpty(finishes)
        ? zero
        : van.derive(() =>
            maxOf(
              finishes.map((s) => s.val),
              0,
            ),
          );

      mut_earlyStart.push(earlyStart);

      mut_earlyFinish.push(
        Arr.isEmpty(finishes)
          ? duration
          : van.derive(() => earlyStart.val + duration.val),
      );
    }

    const ends = lastTasks.flatMap((task) => mut_earlyFinish[task] ?? []);

    const projectEnd = van.derive(() =>
      maxOf(
        ends.map((s) => s.val),
        0,
      ),
    );

    const mut_lateStart: State<number>[] = [];

    const mut_slack: State<number>[] = [];

    for (const task of tasks.toReversed()) {
      const duration = durations[task.id] ?? zero;

      const starts = (successors[task.id] ?? []).flatMap(
        (s) => mut_lateStart[s] ?? [],
      );

      const lateFinish = Arr.isEmpty(starts)
        ? projectEnd
        : van.derive(() =>
            minOf(
              starts.map((s) => s.val),
              0,
            ),
          );

      const lateStart = van.derive(() => lateFinish.val - duration.val);

      const earlyStart = mut_earlyStart[task.id] ?? zero;

      mut_lateStart[task.id] = lateStart;

      mut_slack[task.id] = Arr.isEmpty(task.predecessors)
        ? lateStart
        : van.derive(() => lateStart.val - earlyStart.val);
    }

    const criticalCount = van.derive(() =>
      countZeros(mut_slack.map((s) => s.val)),
    );

    van.add(
      container,
      table(
        tbody(
          tr(td(projectEnd), td(criticalCount)),
          ...shownTasks.map((task) =>
            tr(
              td((task + 1).toString()),
              td(mut_earlyStart[task] ?? zero),
              td(mut_earlyFinish[task] ?? zero),
              td(mut_slack[task] ?? zero),
            ),
          ),
        ),
      ),
    );

    return {
      setDuration: (task, days) => {
        const mut_duration = durations[task];

        if (mut_duration !== undefined) {
          mut_duration.val = days;
        }
      },
      dispose: () => {
        container.replaceChildren();
      },
    } satisfies ScheduleApp;
  },
} as const;
