import {
  combine,
  createState,
  map,
  type InitializedObservable,
} from 'synstate';
import { constant, render, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import type { ScenarioFramework } from '../scenario.mjs';
import {
  changedValuesOnly,
  combineAll,
  everyValue,
  type FigureOutput,
} from '../synstate-graph.mjs';
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
 * `combine` and `map` from the figures it is computed from. The cells bind
 * the figures directly; a number is written as its text.
 *
 * Measured twice: as written, and with a `skipIfNoChange` after every figure
 * (see {@link FigureOutput}).
 */
const synstateDomScheduleWith = (
  name: string,
  output: FigureOutput,
): ScenarioFramework<ScheduleApp> =>
  ({
    name,
    mount: (container) => {
      const durations = initialDurations.map((days) => createState(days));

      const mut_earlyStart: (InitializedObservable<number> | undefined)[] = [];

      const mut_earlyFinish: InitializedObservable<number>[] = [];

      for (const task of tasks) {
        const duration$ = durations[task.id]?.[0];

        if (duration$ === undefined) {
          throw new Error(`no duration for task ${task.id}`);
        }

        const earlyStart$ = Arr.isEmpty(task.predecessors)
          ? undefined
          : combineAll(
              task.predecessors.flatMap((p) => mut_earlyFinish[p] ?? []),
              (finishes) => maxOf(finishes, 0),
              output,
            );

        mut_earlyStart.push(earlyStart$);

        mut_earlyFinish.push(
          earlyStart$ === undefined
            ? duration$
            : output(
                combine([earlyStart$, duration$]).pipe(
                  map(([start, days]) => start + days),
                ),
              ),
        );
      }

      const projectEnd$ = combineAll(
        lastTasks.flatMap((task) => mut_earlyFinish[task] ?? []),
        (finishes) => maxOf(finishes, 0),
        output,
      );

      const mut_lateStart: InitializedObservable<number>[] = [];

      const mut_slack: InitializedObservable<number>[] = [];

      for (const task of tasks.toReversed()) {
        const duration$ = durations[task.id]?.[0];

        if (duration$ === undefined) {
          throw new Error(`no duration for task ${task.id}`);
        }

        const next = successors[task.id] ?? [];

        const lateFinish$ = Arr.isEmpty(next)
          ? projectEnd$
          : combineAll(
              next.flatMap((s) => mut_lateStart[s] ?? []),
              (starts) => minOf(starts, 0),
              output,
            );

        const lateStart$ = output(
          combine([lateFinish$, duration$]).pipe(
            map(([finish, days]) => finish - days),
          ),
        );

        const earlyStart$ = mut_earlyStart[task.id];

        mut_lateStart[task.id] = lateStart$;

        mut_slack[task.id] =
          earlyStart$ === undefined
            ? lateStart$
            : output(
                combine([lateStart$, earlyStart$]).pipe(
                  map(([late, early]) => late - early),
                ),
              );
      }

      const criticalCount$ = combineAll(mut_slack, countZeros, output);

      const zero = constant(0);

      const App = (): JSX.Element => (
        <table>
          <tbody>
            <tr>
              <td>{projectEnd$}</td>
              <td>{criticalCount$}</td>
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
  }) as const;

export const synstateDomSchedule = synstateDomScheduleWith(
  'synstate-dom',
  everyValue,
);

export const synstateDomScheduleChangedOnly = synstateDomScheduleWith(
  'synstate-dom (skipIfNoChange)',
  changedValuesOnly,
);
