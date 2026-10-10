import { memoNamed } from 'preact-utils';
import { type TaskRow } from '../view-model/index.mjs';
import { TaskCard } from './task-card.js';

type Props = Readonly<{
  rows: readonly TaskRow[];
}>;

/** The tasks as cards, on a phone. */
export const TaskCardList = memoNamed<Props>('TaskCardList', (props) => {
  const { rows } = props;

  return (
    <ul className={'task-cards'}>
      {rows.map((row) => (
        <TaskCard key={row.task.id} row={row} />
      ))}
    </ul>
  );
});
