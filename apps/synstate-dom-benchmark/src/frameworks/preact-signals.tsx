/** @jsxImportSource preact */
import {
  batch,
  signal,
  useComputed,
  type ReadonlySignal,
  type Signal,
} from '@preact/signals';
import { render } from 'preact';
import type { BenchApp, Framework } from '../bench-app.mjs';
import { createRowFactory, swapSecondAndSecondToLast } from '../data.mjs';

type PreactRow = Readonly<{ id: number; label: Signal<string> }>;

/**
 * Preact with Signals: a signal per label and one for the selection, both
 * passed to the DOM as signals so that changing them binds without
 * re-rendering a component. The list itself is re-rendered and keyed.
 */
export const preactSignals: Framework = {
  name: 'Preact + Signals',
  mount: (container) => {
    const factory = createRowFactory();

    const mut_rows = signal<readonly PreactRow[]>([]);

    const mut_selected = signal<number | undefined>(undefined);

    const build = (count: number): readonly PreactRow[] =>
      factory
        .build(count)
        .map(({ id, label }) => ({ id, label: signal(label) }));

    render(<App rows={mut_rows} selected={mut_selected} />, container);

    return {
      run: (count) => {
        mut_rows.value = build(count);
      },
      add: (count) => {
        mut_rows.value = [...mut_rows.value, ...build(count)];
      },
      update: () => {
        batch(() => {
          for (const [i, row] of mut_rows.value.entries()) {
            if (i % 10 !== 0) {
              continue;
            }

            const mut_label = row.label;

            mut_label.value = `${mut_label.value} !!!`;
          }
        });
      },
      select: (index) => {
        mut_selected.value = mut_rows.value[index]?.id;
      },
      swapRows: () => {
        mut_rows.value = swapSecondAndSecondToLast(mut_rows.value);
      },
      remove: (index) => {
        mut_rows.value = mut_rows.value.toSpliced(index, 1);
      },
      clear: () => {
        mut_rows.value = [];
      },
      dispose: () => {
        render(null, container);
      },
    } satisfies BenchApp;
  },
} as const;

type AppProps = Readonly<{
  rows: ReadonlySignal<readonly PreactRow[]>;
  selected: ReadonlySignal<number | undefined>;
}>;

const App = ({ rows, selected }: AppProps): preact.JSX.Element => (
  <table>
    <tbody>
      {rows.value.map((row) => (
        <Row key={row.id} row={row} selected={selected} />
      ))}
    </tbody>
  </table>
);

type RowProps = Readonly<{
  row: PreactRow;
  selected: ReadonlySignal<number | undefined>;
}>;

const Row = ({ row, selected }: RowProps): preact.JSX.Element => {
  const className = useComputed(() =>
    selected.value === row.id ? 'danger' : '',
  );

  return (
    <tr class={className}>
      <td>{row.id}</td>
      <td>{row.label}</td>
    </tr>
  );
};
