/** @jsxImportSource synstate-dom-next */
import { constant, render, type JSX } from 'synstate-dom-next';
import { derive, state, type InitializedObservable } from 'synstate-next';
import { Arr } from 'ts-data-forge';
import type { ScenarioFramework } from '../scenario.mjs';
import { deriveAllNext } from '../synstate-next-graph.mjs';
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
 * Each duration is a state, and every figure is a node of its own, made with
 * `derive` from the figures it is computed from, which passes on only a value
 * that changed. The cells bind the figures directly; a number is written as its
 * text.
 */
export const synstateDomNextSchedule: ScenarioFramework<ScheduleApp> = {
  name: 'synstate-dom-next',
  mount: (container) => {
    const durations = initialDurations.map((days) => state(days));

    const mut_earlyStart: (InitializedObservable<number> | undefined)[] = [];

    const mut_earlyFinish: InitializedObservable<number>[] = [];

    for (const task of tasks) {
      const duration = durations[task.id];

      if (duration === undefined) {
        throw new Error(`no duration for task ${task.id}`);
      }

      const earlyStart = Arr.isEmpty(task.predecessors)
        ? undefined
        : deriveAllNext(
            task.predecessors.flatMap((p) => mut_earlyFinish[p] ?? []),
            (finishes) => maxOf(finishes, 0),
          );

      mut_earlyStart.push(earlyStart);

      mut_earlyFinish.push(
        earlyStart === undefined
          ? duration
          : derive([earlyStart, duration], (start, days) => start + days),
      );
    }

    const projectEnd = deriveAllNext(
      lastTasks.flatMap((task) => mut_earlyFinish[task] ?? []),
      (finishes) => maxOf(finishes, 0),
    );

    const mut_lateStart: InitializedObservable<number>[] = [];

    const mut_slack: InitializedObservable<number>[] = [];

    for (const task of tasks.toReversed()) {
      const duration = durations[task.id];

      if (duration === undefined) {
        throw new Error(`no duration for task ${task.id}`);
      }

      const next = successors[task.id] ?? [];

      const lateFinish = Arr.isEmpty(next)
        ? projectEnd
        : deriveAllNext(
            next.flatMap((s) => mut_lateStart[s] ?? []),
            (starts) => minOf(starts, 0),
          );

      const lateStart = derive(
        [lateFinish, duration],
        (finish, days) => finish - days,
      );

      const earlyStart = mut_earlyStart[task.id];

      mut_lateStart[task.id] = lateStart;

      mut_slack[task.id] =
        earlyStart === undefined
          ? lateStart
          : derive([lateStart, earlyStart], (late, early) => late - early);
    }

    const criticalCount = deriveAllNext(mut_slack, countZeros);

    const zero = constant(0);

    const App = (): JSX.Element => (
      <table>
        <tbody>
          <tr>
            <td>{projectEnd}</td>
            <td>{criticalCount}</td>
          </tr>
          {shownTasks.map((task) => (
            <tr>
              <td>{constant((task + 1).toString())}</td>
              <td>{mut_earlyStart[task] ?? zero}</td>
              <td>{mut_earlyFinish[task] ?? zero}</td>
              <td>{mut_slack[task] ?? zero}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    const unmount = render(App, container);

    return {
      setDuration: (task, days) => {
        durations[task]?.set(days);
      },
      dispose: unmount,
    } satisfies ScheduleApp;
  },
} as const;
