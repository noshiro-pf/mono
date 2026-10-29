import { constant, For, type Bindable, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import type { TaskRow } from '../view-model/index.mjs';
import { TaskTableRow } from './task-table-row.js';

type Props = Readonly<{
  rows: Bindable<readonly TaskRow[]>;
}>;

/** The tasks as a table, on a screen wide enough for one. */
export const TaskTable = ({ rows }: Props): JSX.Element => (
  <table class={constant('bp6-html-table bp6-interactive task-table')}>
    <thead>
      <tr>
        <th scope={constant('col')}>{constant(m.fields.status)}</th>
        <th scope={constant('col')}>{constant(m.fields.title)}</th>
        <th scope={constant('col')}>{constant(m.fields.priority)}</th>
        <th scope={constant('col')}>{constant(m.fields.dueDate)}</th>
        <th scope={constant('col')}>{constant(m.fields.labels)}</th>
        <th scope={constant('col')}>{constant(m.fields.estimate)}</th>
      </tr>
    </thead>
    <tbody>
      <For items={rows} key={(row) => row.task.id}>
        {(row$) => <TaskTableRow row={row$} />}
      </For>
    </tbody>
  </table>
);
