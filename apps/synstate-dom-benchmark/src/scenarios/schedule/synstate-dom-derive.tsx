import { createState, derive, type InitializedObservable } from 'synstate';
import { constant, render, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { ScenarioFramework } from '../scenario.mjs';
import { deriveAll } from '../synstate-graph.mjs';
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
 * synstate-dom-next's form (see `./synstate-dom-next.tsx`) with synstate and
 * synstate-dom, for the `next` set: every figure is one `derive`, which passes
 * on only a value that changed, so that the comparison is of the libraries
 * rather than of `combine` + `map` against `derive`. The cells bind the figures
 * directly; a number is written as its text.
 */
export const synstateDomDeriveSchedule: ScenarioFramework<ScheduleApp> = {
  name: 'synstate-dom (derive)',
  mount: (container) => {
    const durations = initialDurations.map((days) => createState(days));

    const mut_earlyStart: (InitializedObservable<number> | undefined)[] = [];

    const mut_earlyFinish: InitializedObservable<number>[] = [];

    for (const task of tasks) {
      const duration = durations[task.id]?.[0];

      if (duration === undefined) {
        throw new Error(`no duration for task ${task.id}`);
      }

      const earlyStart = Arr.isEmpty(task.predecessors)
        ? undefined
        : deriveAll(
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

    const projectEnd = deriveAll(
      lastTasks.flatMap((task) => mut_earlyFinish[task] ?? []),
      (finishes) => maxOf(finishes, 0),
    );

    const mut_lateStart: InitializedObservable<number>[] = [];

    const mut_slack: InitializedObservable<number>[] = [];

    for (const task of tasks.toReversed()) {
      const duration = durations[task.id]?.[0];

      if (duration === undefined) {
        throw new Error(`no duration for task ${task.id}`);
      }

      const next = successors[task.id] ?? [];

      const lateFinish = Arr.isEmpty(next)
        ? projectEnd
        : deriveAll(
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

    const criticalCount = deriveAll(mut_slack, countZeros);

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
        durations[task]?.[1](days);
      },
      dispose: unmount,
    } satisfies ScheduleApp;
  },
} as const;
