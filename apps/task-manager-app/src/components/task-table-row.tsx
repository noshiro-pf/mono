import { memoNamed } from 'preact-utils';
import { useCallback } from 'preact/hooks';
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
  row: TaskRow;
}>;

/**
 * One task. The title is a button that opens the dialog, and it is stretched
 * over the whole row (`index.css`), so the row is one tap target without
 * being an interactive element itself.
 */
export const TaskTableRow = memoNamed<Props>('TaskTableRow', (props) => {
  const { row } = props;

  const { task } = row;

  const openNode = useCallback(() => {
    editorStore.open({ kind: 'task', id: task.id });
  }, [task.id]);

  return (
    <tr className={row.status === 'done' ? 'task-row done' : 'task-row'}>
      <td>
        <span className={'badges'}>
          <StatusBadge displayStatus={row.status} />
          {row.startedWithUnmetDependencies ? <WarningBadge /> : undefined}
        </span>
      </td>
      <td>
        <button
          className={'row-link'}
          data-e2e={'task-row'}
          type={'button'}
          onClick={openNode}
        >
          {task.title}
        </button>
      </td>
      <td>{`${task.priority} ${priorityLabels[task.priority]}`}</td>
      <td>
        <DueDate dueDate={task.dueDate} overdue={row.overdue} />
      </td>
      <td>
        <LabelChips labels={task.labels} />
      </td>
      <td>{formatEstimate(task.estimateHours)}</td>
    </tr>
  );
});
