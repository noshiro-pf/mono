/** @jsxImportSource solid-js */
import { createMemo, createRoot, createSignal, type Accessor } from 'solid-js';
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

const zero = (): number => 0;

/**
 * Each duration is a signal, and every figure is a `createMemo` of its own,
 * reading the figures it is computed from. The cells read the figures in JSX
 * expressions.
 */
export const solidSchedule: ScenarioFramework<ScheduleApp> = {
  name: 'Solid',
  mount: (container) =>
    createRoot((dispose) => {
      const durations = initialDurations.map((days) => createSignal(days));

      const mut_earlyStart: Accessor<number>[] = [];

      const mut_earlyFinish: Accessor<number>[] = [];

      for (const task of tasks) {
        const duration = durations[task.id]?.[0] ?? zero;

        const finishes = task.predecessors.flatMap(
          (p) => mut_earlyFinish[p] ?? [],
        );

        const earlyStart = Arr.isEmpty(finishes)
          ? zero
          : createMemo(() =>
              maxOf(
                finishes.map((f) => f()),
                0,
              ),
            );

        mut_earlyStart.push(earlyStart);

        mut_earlyFinish.push(
          Arr.isEmpty(finishes)
            ? duration
            : createMemo(() => earlyStart() + duration()),
        );
      }

      const ends = lastTasks.flatMap((task) => mut_earlyFinish[task] ?? []);

      const projectEnd = createMemo(() =>
        maxOf(
          ends.map((f) => f()),
          0,
        ),
      );

      const mut_lateStart: Accessor<number>[] = [];

      const mut_slack: Accessor<number>[] = [];

      for (const task of tasks.toReversed()) {
        const duration = durations[task.id]?.[0] ?? zero;

        const starts = (successors[task.id] ?? []).flatMap(
          (s) => mut_lateStart[s] ?? [],
        );

        const lateFinish = Arr.isEmpty(starts)
          ? projectEnd
          : createMemo(() =>
              minOf(
                starts.map((f) => f()),
                0,
              ),
            );

        const lateStart = createMemo(() => lateFinish() - duration());

        const earlyStart = mut_earlyStart[task.id] ?? zero;

        mut_lateStart[task.id] = lateStart;

        mut_slack[task.id] = Arr.isEmpty(task.predecessors)
          ? lateStart
          : createMemo(() => lateStart() - earlyStart());
      }

      const criticalCount = createMemo(() =>
        countZeros(mut_slack.map((f) => f())),
      );

      const element = (
        <table>
          <tbody>
            <tr>
              <td>{projectEnd()}</td>
              <td>{criticalCount()}</td>
            </tr>
            {shownTasks.map((task) => {
              const earlyStart = mut_earlyStart[task] ?? zero;

              const earlyFinish = mut_earlyFinish[task] ?? zero;

              const slack = mut_slack[task] ?? zero;

              return (
                <tr>
                  <td>{(task + 1).toString()}</td>
                  <td>{earlyStart()}</td>
                  <td>{earlyFinish()}</td>
                  <td>{slack()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );

      // A `<table>` expression is a `HTMLTableElement` at run time; Solid
      // types every JSX expression as its broader `JSX.Element`.
      if (element instanceof Node) {
        container.append(element);
      }

      return {
        setDuration: (task, days) => {
          durations[task]?.[1](days);
        },
        dispose: () => {
          dispose();

          container.replaceChildren();
        },
      } satisfies ScheduleApp;
    }),
} as const;
