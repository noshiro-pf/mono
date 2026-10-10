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

/** One task as a card that opens the dialog when tapped. */
export const TaskCard = memoNamed<Props>('TaskCard', (props) => {
  const { row } = props;

  const { task } = row;

  const openNode = useCallback(() => {
    editorStore.open({ kind: 'task', id: task.id });
  }, [task.id]);

  const estimate = formatEstimate(task.estimateHours);

  return (
    <li>
      <button
        className={
          row.status === 'done'
            ? 'bp6-card task-card done'
            : 'bp6-card task-card'
        }
        data-e2e={'task-row'}
        type={'button'}
        onClick={openNode}
      >
        <span className={'task-card-top'}>
          <StatusBadge displayStatus={row.status} />
          {row.startedWithUnmetDependencies ? <WarningBadge /> : undefined}
          <span className={'task-card-priority'}>
            {`優先度 ${priorityLabels[task.priority]}`}
          </span>
        </span>
        <span className={'task-card-title'}>{task.title}</span>
        <span className={'task-card-meta'}>
          <DueDate dueDate={task.dueDate} overdue={row.overdue} />
          {estimate === '' ? undefined : <span>{`見積 ${estimate}`}</span>}
          <LabelChips labels={task.labels} />
        </span>
      </button>
    </li>
  );
});
