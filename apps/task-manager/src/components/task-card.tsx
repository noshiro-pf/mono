import { type InitializedObservable, map } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import { m } from '../i18n/index.mjs';
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

/** One task as a card that opens the dialog when tapped. */
export const TaskCard = ({ row }: Props): JSX.Element => (
  <li>
    <button
      class={row.pipe(
        map(({ status }) =>
          status === 'done' ? 'bp6-card task-card done' : 'bp6-card task-card',
        ),
      )}
      data-e2e={constant('task-row')}
      type={constant('button')}
      onClick={() => {
        editorStore.open({
          kind: 'task',
          id: Optional.unwrap(row.getSnapshot()).task.id,
        });
      }}
    >
      <span class={constant('task-card-top')}>
        <StatusBadge displayStatus={row.pipe(map(({ status }) => status))} />
        <If
          cond={row.pipe(map((r) => r.startedWithUnmetDependencies))}
          then={<WarningBadge />}
        />
        <span class={constant('task-card-priority')}>
          {row.pipe(
            map(({ task }) => m.list.priority(priorityLabels[task.priority])),
          )}
        </span>
      </span>
      <span class={constant('task-card-title')}>
        {row.pipe(map(({ task }) => task.title))}
      </span>
      <span class={constant('task-card-meta')}>
        <DueDate
          dueDate={row.pipe(map(({ task }) => dueOf(task)))}
          overdue={row.pipe(map(({ overdue }) => overdue))}
        />
        <If
          cond={row.pipe(
            map(({ task }) => formatEstimate(task.estimateHours) !== ''),
          )}
          then={
            <span>
              {row.pipe(
                map(({ task }) =>
                  m.list.estimate(formatEstimate(task.estimateHours)),
                ),
              )}
            </span>
          }
        />
        <LabelChips labels={row.pipe(map(({ task }) => task.labels))} />
      </span>
    </button>
  </li>
);
