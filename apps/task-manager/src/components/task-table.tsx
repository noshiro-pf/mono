import { constant, For, type Bindable, type JSX } from 'synstate-dom';
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
        <th scope={constant('col')}>{constant('状態')}</th>
        <th scope={constant('col')}>{constant('タイトル')}</th>
        <th scope={constant('col')}>{constant('優先度')}</th>
        <th scope={constant('col')}>{constant('期限')}</th>
        <th scope={constant('col')}>{constant('ラベル')}</th>
        <th scope={constant('col')}>{constant('見積')}</th>
      </tr>
    </thead>
    <tbody>
      <For items={rows} key={(row) => row.task.id}>
        {(row$) => <TaskTableRow row={row$} />}
      </For>
    </tbody>
  </table>
);
