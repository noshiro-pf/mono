/**
 * What each node of the DAG shows at a time: its title cut to fit, both a
 * standard node and a compact one (`view-model/node-size.mts`), and the
 * state that colours it — a task's display status, a milestone's reached or
 * not. Separate from the layout, which does not change with any of it.
 */

import { type DeepReadonly } from 'ts-type-forge';
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
import { displayStatusLabels, priorityLabels } from '../view-model/index.mjs';
import { truncateToUnits } from './truncate.mjs';

export const buildNodeViews = (
  state: DomainState,
  now: number,
): ReadonlyMap<GraphNodeId, NodeView> => {
  const context = buildEvaluationContext(state);

  const evaluator = createEvaluator(context, now);

  const taskViews = state.tasks.map(
    (task): readonly [GraphNodeId, NodeView] => {
      const ref = { kind: 'task', id: task.id } as const;

      const shown = displayStatus(task, context, now);

      const warning = isStartedWithUnmetDependencies(task, context, now);

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
          status: shown,
          priority: task.priority,
          warning,
          ariaLabel: [
            `タスク「${task.title}」`,
            `状態: ${displayStatusLabels[shown]}`,
            `優先度: ${priorityLabels[task.priority]}`,
            ...(warning ? ['依存が未解消のまま開始'] : []),
          ].join(' '),
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
          reached,
          awaitingCheck,
          ariaLabel: [
            `マイルストーン「${milestone.title}」`,
            reached ? '到達済み' : '未到達',
            ...(awaitingCheck ? ['解消待ち'] : []),
          ].join(' '),
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
  status: DisplayStatus;
  priority: Priority;
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
  reached: boolean;
  awaitingCheck: boolean;
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

/** The warning at the end of a compact task's line, and the space before it. */
const WARNING_UNITS = 2;

/** `☐ ` before an awaiting milestone's title. */
const CHECK_BOX_UNITS = 3;
