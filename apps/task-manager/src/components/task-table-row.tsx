import type { InitializedObservable } from 'synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import { editorStore } from '../store/index.mjs';
import {
  formatEstimate,
  priorityLabels,
  type TaskRow,
} from '../view-model/index.mjs';
import { DueDate, dueOf } from './due-date.js';
import { LabelChips } from './label-chips.js';
import { StatusBadge } from './status-badge.js';
import { WarningBadge } from './warning-badge.js';

type Props = Readonly<{
  row: InitializedObservable<TaskRow>;
}>;

/**
 * One task. The title is a button that opens the dialog, and it is stretched
 * over the whole row (`index.css`), so the row is one tap target without being
 * an interactive element itself.
 */
export const TaskTableRow = ({ row }: Props): JSX.Element => (
  <tr
    class={view(row, ({ status }) =>
      status === 'done' ? 'task-row done' : 'task-row',
    )}
  >
    <td>
      <span class={constant('badges')}>
        <StatusBadge displayStatus={view(row, ({ status }) => status)} />
        <If
          cond={view(row, (r) => r.startedWithUnmetDependencies)}
          then={<WarningBadge />}
        />
      </span>
    </td>
    <td>
      <button
        class={constant('row-link')}
        data-e2e={constant('task-row')}
        type={constant('button')}
        onClick={() => {
          editorStore.open({
            kind: 'task',
            id: row.getSnapshot().value.task.id,
          });
        }}
      >
        {view(row, ({ task }) => task.title)}
      </button>
    </td>
    <td>
      {view(
        row,
        ({ task }) => `${task.priority} ${priorityLabels[task.priority]}`,
      )}
    </td>
    <td>
      <DueDate
        dueDate={view(row, ({ task }) => dueOf(task))}
        overdue={view(row, ({ overdue }) => overdue)}
      />
    </td>
    <td>
      <LabelChips labels={view(row, ({ task }) => task.labels)} />
    </td>
    <td>{view(row, ({ task }) => formatEstimate(task.estimateHours))}</td>
  </tr>
);
