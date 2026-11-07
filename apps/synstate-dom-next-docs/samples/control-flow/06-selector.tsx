import { For, selector, type JSX } from 'synstate-dom-next';
import { createState, map } from 'synstate-next';

type Row = Readonly<{ id: number; label: string }>;

const [rows$] = createState<readonly Row[]>([
  { id: 1, label: 'first' },
  { id: 2, label: 'second' },
]);

const [selectedId$, setSelectedId] = createState<number | undefined>(undefined);

// Made once, outside the rows: it remembers which rows watch which id.
const selected = selector(selectedId$);

// Selecting a row writes to two rows (the one that was selected and the one
// that is), however many rows there are.
export const Table = (): JSX.Element => (
  <ul>
    <For items={rows$} key={(row) => row.id}>
      {(row$) => (
        <li
          class={{ selected: selected.is(row$.value.id) }}
          onClick={() => {
            setSelectedId(row$.value.id);
          }}
        >
          {row$.pipe(map((row) => row.label))}
        </li>
      )}
    </For>
  </ul>
);
