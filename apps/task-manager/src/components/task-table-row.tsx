import { type InitializedObservable, map } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
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
    class={row.pipe(
      map(({ status }) => (status === 'done' ? 'task-row done' : 'task-row')),
    )}
  >
    <td>
      <span class={constant('badges')}>
        <StatusBadge displayStatus={row.pipe(map(({ status }) => status))} />
        <If
          cond={row.pipe(map((r) => r.startedWithUnmetDependencies))}
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
            id: Optional.unwrap(row.getSnapshot()).task.id,
          });
        }}
      >
        {row.pipe(map(({ task }) => task.title))}
      </button>
    </td>
    <td>
      {row.pipe(
        map(({ task }) => `${task.priority} ${priorityLabels[task.priority]}`),
      )}
    </td>
    <td>
      <DueDate
        dueDate={row.pipe(map(({ task }) => dueOf(task)))}
        overdue={row.pipe(map(({ overdue }) => overdue))}
      />
    </td>
    <td>
      <LabelChips labels={row.pipe(map(({ task }) => task.labels))} />
    </td>
    <td>{row.pipe(map(({ task }) => formatEstimate(task.estimateHours)))}</td>
  </tr>
);
