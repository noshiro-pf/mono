import { For, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';

type Row = Readonly<{ id: number; label: string }>;

const [rows$] = createState<readonly Row[]>([
  { id: 1, label: 'first' },
  { id: 2, label: 'second' },
]);

// The row function runs once per key. When `rows$` changes, an existing row
// receives its new item and index through `row$` and `index$`; reordering moves
// its nodes rather than recreating them.
export const Table = (): JSX.Element => (
  <ul>
    <For items={rows$} key={(row) => row.id}>
      {(row$, index$) => (
        <li>
          {index$.pipe(map((i) => `${i + 1}. `))}
          {row$.pipe(map((row) => row.label))}
        </li>
      )}
    </For>
  </ul>
);
