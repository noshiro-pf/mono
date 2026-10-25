/** @jsxImportSource preact */
import { computed, signal, type ReadonlySignal } from '@preact/signals';
import { render } from 'preact';
import { Arr } from 'ts-data-forge';
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

/**
 * Each duration is a signal, and every figure is a `computed` of its own,
 * reading the figures it is computed from. The cells are given the figures as
 * signals, so that they bind without re-rendering a component.
 */
export const preactSignalsSchedule: ScenarioFramework<ScheduleApp> = {
  name: 'Preact + Signals',
  mount: (container) => {
    const zero = signal(0);

    const durations = initialDurations.map((days) => signal(days));

    const mut_earlyStart: ReadonlySignal<number>[] = [];

    const mut_earlyFinish: ReadonlySignal<number>[] = [];

    for (const task of tasks) {
      const duration = durations[task.id] ?? zero;

      const finishes = task.predecessors.flatMap(
        (p) => mut_earlyFinish[p] ?? [],
      );

      const earlyStart = Arr.isEmpty(finishes)
        ? zero
        : computed(() =>
            maxOf(
              finishes.map((s) => s.value),
              0,
            ),
          );

      mut_earlyStart.push(earlyStart);

      mut_earlyFinish.push(
        Arr.isEmpty(finishes)
          ? duration
          : computed(() => earlyStart.value + duration.value),
      );
    }

    const ends = lastTasks.flatMap((task) => mut_earlyFinish[task] ?? []);

    const projectEnd = computed(() =>
      maxOf(
        ends.map((s) => s.value),
        0,
      ),
    );

    const mut_lateStart: ReadonlySignal<number>[] = [];

    const mut_slack: ReadonlySignal<number>[] = [];

    for (const task of tasks.toReversed()) {
      const duration = durations[task.id] ?? zero;

      const starts = (successors[task.id] ?? []).flatMap(
        (s) => mut_lateStart[s] ?? [],
      );

      const lateFinish = Arr.isEmpty(starts)
        ? projectEnd
        : computed(() =>
            minOf(
              starts.map((s) => s.value),
              0,
            ),
          );

      const lateStart = computed(() => lateFinish.value - duration.value);

      const earlyStart = mut_earlyStart[task.id] ?? zero;

      mut_lateStart[task.id] = lateStart;

      mut_slack[task.id] = Arr.isEmpty(task.predecessors)
        ? lateStart
        : computed(() => lateStart.value - earlyStart.value);
    }

    const criticalCount = computed(() =>
      countZeros(mut_slack.map((s) => s.value)),
    );

    render(
      <table>
        <tbody>
          <tr>
            <td>{projectEnd}</td>
            <td>{criticalCount}</td>
          </tr>
          {shownTasks.map((task) => (
            <tr key={task}>
              <td>{(task + 1).toString()}</td>
              <td>{mut_earlyStart[task] ?? zero}</td>
              <td>{mut_earlyFinish[task] ?? zero}</td>
              <td>{mut_slack[task] ?? zero}</td>
            </tr>
          ))}
        </tbody>
      </table>,
      container,
    );

    return {
      setDuration: (task, days) => {
        const mut_duration = durations[task];

        if (mut_duration !== undefined) {
          mut_duration.value = days;
        }
      },
      dispose: () => {
        render(null, container);
      },
    } satisfies ScheduleApp;
  },
} as const;
