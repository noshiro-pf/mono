import { memoNamed } from 'preact-utils';
import { type TaskRow } from '../view-model/index.mjs';
import { TaskTableRow } from './task-table-row.js';

type Props = Readonly<{
  rows: readonly TaskRow[];
}>;

/** The tasks as a table, on a screen wide enough for one. */
export const TaskTable = memoNamed<Props>('TaskTable', (props) => {
  const { rows } = props;

  return (
    <table className={'bp6-html-table bp6-interactive task-table'}>
      <thead>
        <tr>
          <th scope={'col'}>{'状態'}</th>
          <th scope={'col'}>{'タイトル'}</th>
          <th scope={'col'}>{'優先度'}</th>
          <th scope={'col'}>{'期限'}</th>
          <th scope={'col'}>{'ラベル'}</th>
          <th scope={'col'}>{'見積'}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <TaskTableRow key={row.task.id} row={row} />
        ))}
      </tbody>
    </table>
  );
});
