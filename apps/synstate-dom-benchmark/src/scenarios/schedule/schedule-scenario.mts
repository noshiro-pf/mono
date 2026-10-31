import type { Scenario } from '../scenario.mjs';
import {
  computeSchedule,
  initialDurations,
  taskCount,
  type ScheduleApp,
} from './model.mjs';
import { preactSignalsSchedule } from './preact-signals.js';
import { preactSchedule } from './preact.js';
import { reactSchedule } from './react.js';
import { solidSchedule } from './solid.js';
import {
  synstateDomSchedule,
  synstateDomScheduleChangedOnly,
} from './synstate-dom.js';
import { vanjsSchedule } from './vanjs.mjs';

/** Lengthening `task` by `days`, from the initial durations. */
const lengthenCase = (
  name: string,
  task: number,
  days: number,
): Scenario<ScheduleApp>['cases'][number] => {
  const initial = initialDurations[task] ?? 0;

  return {
    name,
    apply: (app) => {
      app.setDuration(task, initial + days);
    },
    revert: (app) => {
      app.setDuration(task, initial);
    },
    expected: computeSchedule(initialDurations.with(task, initial + days)),
  };
};

/**
 * The critical path of 1,000 tasks, with the last 50 shown. Lengthening the
 * first task moves nearly every figure; lengthening one in the middle moves a
 * few dozen, because the slack of the tasks around it absorbs the change, so a
 * library that stops at a value that did not change does much less work than
 * one that recomputes everything downstream.
 */
export const scheduleScenario: Scenario<ScheduleApp> = {
  buildName: 'schedule: build the schedule',
  initial: computeSchedule(initialDurations),
  cases: [
    lengthenCase('schedule: lengthen the first task', 0, 5),
    lengthenCase('schedule: lengthen a task in the middle', taskCount / 2, 3),
    lengthenCase('schedule: lengthen a task near the end', taskCount - 10, 2),
  ],
  frameworks: [
    synstateDomSchedule,
    synstateDomScheduleChangedOnly,
    solidSchedule,
    preactSignalsSchedule,
    preactSchedule,
    reactSchedule,
    vanjsSchedule,
  ],
} as const;
