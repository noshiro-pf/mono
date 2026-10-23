import type { InitializedObservable } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import { editorStore } from '../store/index.mjs';
import {
  formatEstimate,
  priorityLabels,
  type TaskRow,
} from '../view-model/index.mjs';
import { DueDate } from './due-date.js';
import { LabelChips } from './label-chips.js';
import { StatusBadge } from './status-badge.js';
import { WarningBadge } from './warning-badge.js';

type Props = Readonly<{
  row: InitializedObservable<TaskRow>;
}>;

/** One task as a card that opens the dialog when tapped. */
export const TaskCard = ({ row }: Props): JSX.Element => (
  <li>
    <button
      class={view(row, ({ status }) =>
        status === 'done' ? 'bp6-card task-card done' : 'bp6-card task-card',
      )}
      data-e2e={constant('task-row')}
      type={constant('button')}
      onClick={() => {
        editorStore.open({ kind: 'task', id: row.getSnapshot().value.task.id });
      }}
    >
      <span class={constant('task-card-top')}>
        <StatusBadge displayStatus={view(row, ({ status }) => status)} />
        <If
          cond={view(row, (r) => r.startedWithUnmetDependencies)}
          then={<WarningBadge />}
        />
        <span class={constant('task-card-priority')}>
          {view(row, ({ task }) => `優先度 ${priorityLabels[task.priority]}`)}
        </span>
      </span>
      <span class={constant('task-card-title')}>
        {view(row, ({ task }) => task.title)}
      </span>
      <span class={constant('task-card-meta')}>
        <DueDate
          dueDate={view(row, ({ task }) => task.dueDate)}
          overdue={view(row, ({ overdue }) => overdue)}
        />
        <If
          cond={view(
            row,
            ({ task }) => formatEstimate(task.estimateHours) !== '',
          )}
          then={
            <span>
              {view(
                row,
                ({ task }) => `見積 ${formatEstimate(task.estimateHours)}`,
              )}
            </span>
          }
        />
        <LabelChips labels={view(row, ({ task }) => task.labels)} />
      </span>
    </button>
  </li>
);
