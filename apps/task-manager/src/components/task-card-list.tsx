import { constant, For, type Bindable, type JSX } from 'synstate-dom';
import type { TaskRow } from '../view-model/index.mjs';
import { TaskCard } from './task-card.js';

type Props = Readonly<{
  rows: Bindable<readonly TaskRow[]>;
}>;

/** The tasks as cards, on a phone. */
export const TaskCardList = ({ rows }: Props): JSX.Element => (
  <ul class={constant('task-cards')}>
    <For items={rows} key={(row) => row.task.id}>
      {(row$) => <TaskCard row={row$} />}
    </For>
  </ul>
);
