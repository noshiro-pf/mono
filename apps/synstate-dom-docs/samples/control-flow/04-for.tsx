import { createState } from 'synstate';
import { For, inlineMap, type JSX } from 'synstate-dom';

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
          {inlineMap(index$, (i) => `${i + 1}. `)}
          {inlineMap(row$, (row) => row.label)}
        </li>
      )}
    </For>
  </ul>
);
