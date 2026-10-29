/**
 * What each node of the DAG shows at a time: its title cut to fit a node of
 * each size (`view-model/node-size.mts`), on up to three lines on a large
 * one; the state that colours it — a task's display status, a milestone's
 * reached or not —; a task's due date and priority, and a milestone's date.
 * Separate from the layout, which does not change with any of it.
 */

import type { DeepReadonly } from 'ts-type-forge';
import {
  buildEvaluationContext,
  createEvaluator,
  displayStatus,
  isStartedWithUnmetDependencies,
  nodeId,
  type DisplayStatus,
  type DomainState,
  type GraphNodeId,
  type MilestoneId,
  type Priority,
  type TaskId,
} from '../domain/index.mjs';
import { m } from '../i18n/index.mjs';
import {
  displayStatusLabels,
  formatShortWhen,
  formatWhen,
  priorityLabels,
} from '../view-model/index.mjs';
import { truncateToUnits, wrapToUnits } from './truncate.mjs';

/** `timeZone` is for the tests; the page passes none and gets the browser's. */
export const buildNodeViews = (
  state: DomainState,
  now: number,
  timeZone?: string,
): ReadonlyMap<GraphNodeId, NodeView> => {
  const context = buildEvaluationContext(state);

  const evaluator = createEvaluator(context, now);

  const taskViews = state.tasks.map(
    (task): readonly [GraphNodeId, NodeView] => {
      const ref = { kind: 'task', id: task.id } as const;

      const shown = displayStatus(task, context, now);

      const warning = isStartedWithUnmetDependencies(task, context, now);

      const { dueDate } = task;

      // As the list marks it (`view-model/rows.mts`).
      const overdue =
        task.progress !== 'done' && dueDate !== undefined && dueDate < now;

      return [
        nodeId(ref),
        {
          kind: 'task',
          ref,
          title: task.title,
          shortTitle: truncateToUnits(task.title, TASK_TITLE_UNITS),
          compactTitle: truncateToUnits(
            task.title,
            warning
              ? COMPACT_TASK_TITLE_UNITS - WARNING_UNITS
              : COMPACT_TASK_TITLE_UNITS,
          ),
          largeTitle: wrapToUnits(
            task.title,
            LARGE_TASK_TITLE_UNITS,
            LARGE_TITLE_LINES,
          ),
          status: shown,
          priority: task.priority,
          due:
            dueDate === undefined
              ? m.dag.noDue
              : (overdue ? m.dag.overdue : m.dag.due)(
                  formatShortWhen(dueDate, task.dueAllDay, now, timeZone),
                ),
          overdue,
          warning,
          ariaLabel: [
            m.dag.taskLabel(task.title),
            m.dag.statusPart(displayStatusLabels[shown]),
            ...(dueDate === undefined
              ? []
              : [m.dag.duePart(formatWhen(dueDate, task.dueAllDay, timeZone))]),
            ...(overdue ? [m.dag.overduePart] : []),
            m.dag.priorityPart(priorityLabels[task.priority]),
            ...(warning ? [m.dag.warningPart] : []),
          ].join(m.dag.partSeparator),
        },
      ];
    },
  );

  const milestoneViews = state.milestones.map(
    (milestone): readonly [GraphNodeId, NodeView] => {
      const ref = { kind: 'milestone', id: milestone.id } as const;

      const reached = evaluator.milestoneReachedAt(milestone) !== undefined;

      const awaitingCheck =
        milestone.requiresManualCheck && milestone.checkedAt === undefined;

      const { date } = milestone;

      return [
        nodeId(ref),
        {
          kind: 'milestone',
          ref,
          title: milestone.title,
          shortTitle: truncateToUnits(milestone.title, MILESTONE_TITLE_UNITS),
          compactTitle: truncateToUnits(
            milestone.title,
            awaitingCheck
              ? COMPACT_MILESTONE_TITLE_UNITS - CHECK_BOX_UNITS
              : COMPACT_MILESTONE_TITLE_UNITS,
          ),
          largeTitle: wrapToUnits(
            milestone.title,
            LARGE_MILESTONE_TITLE_UNITS,
            LARGE_TITLE_LINES,
            awaitingCheck
              ? LARGE_MILESTONE_TITLE_UNITS - CHECK_BOX_UNITS
              : LARGE_MILESTONE_TITLE_UNITS,
          ),
          reached,
          awaitingCheck,
          date:
            date === undefined
              ? undefined
              : m.dag.milestoneDate(
                  formatShortWhen(date, milestone.dateAllDay, now, timeZone),
                ),
          ariaLabel: [
            m.dag.milestoneLabel(milestone.title),
            reached ? m.dag.reachedPart : m.dag.unreachedPart,
            ...(date === undefined
              ? []
              : [
                  m.dag.datePart(
                    formatWhen(date, milestone.dateAllDay, timeZone),
                  ),
                ]),
            ...(awaitingCheck ? [m.dag.awaitingCheckPart] : []),
          ].join(m.dag.partSeparator),
        },
      ];
    },
  );

  const entries: readonly (readonly [GraphNodeId, NodeView])[] = [
    ...taskViews,
    ...milestoneViews,
  ] as const;

  return new Map(entries);
};

export type NodeView = TaskNodeView | MilestoneNodeView;

export type TaskNodeView = DeepReadonly<{
  kind: 'task';
  ref: { kind: 'task'; id: TaskId };
  title: string;
  shortTitle: string;
  /** Cut to fit a compact node, beside the warning if there is one. */
  compactTitle: string;
  /** Broken into the lines of a large node, the last cut if need be. */
  largeTitle: string[];
  status: DisplayStatus;
  priority: Priority;
  /**
   * `期限 10/09 12:05` (`期限 10/09` all day), `期限切れ 10/09 12:05` or
   * `期限なし`: a node's second line.
   */
  due: string;
  /** Past its due date and not done. */
  overdue: boolean;
  /** Started while a dependency does not hold. */
  warning: boolean;
  ariaLabel: string;
}>;

export type MilestoneNodeView = DeepReadonly<{
  kind: 'milestone';
  ref: { kind: 'milestone'; id: MilestoneId };
  title: string;
  shortTitle: string;
  /** Cut to fit a compact node, after the check box if there is one. */
  compactTitle: string;
  /**
   * Broken into the lines of a large node, the last cut if need be, the
   * first after the check box if there is one.
   */
  largeTitle: string[];
  reached: boolean;
  awaitingCheck: boolean;
  /**
   * `日時 10/09 12:05` (`日時 10/09` all day), the date it waits for, as a task's due date is
   * written: a node's second line; `undefined` without one.
   */
  date: string | undefined;
  ariaLabel: string;
}>;

/** What fits on a task node beside its priority, in `truncate.mts` units. */
const TASK_TITLE_UNITS = 22;

/** What fits inside a milestone's shape. */
const MILESTONE_TITLE_UNITS = 18;

/** What fits on a compact task node, its only line. */
const COMPACT_TASK_TITLE_UNITS = 17;

/** What fits inside a compact milestone's shape. */
const COMPACT_MILESTONE_TITLE_UNITS = 15;

/** What fits on each line of a large task node. */
const LARGE_TASK_TITLE_UNITS = 32;

/**
 * What fits on each line inside a large milestone's shape, which narrows
 * towards its top and bottom.
 */
const LARGE_MILESTONE_TITLE_UNITS = 22;

/** The most lines of title a large node shows. */
const LARGE_TITLE_LINES = 3;

/** The warning at the end of a compact task's line, and the space before it. */
const WARNING_UNITS = 2;

/** `☐ ` before an awaiting milestone's title. */
const CHECK_BOX_UNITS = 3;
