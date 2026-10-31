import { createState } from 'synstate';
import { constant, For, render, view, type JSX } from 'synstate-dom';
import type { BenchApp, Framework } from '../bench-app.mjs';
import {
  createRowFactory,
  swapSecondAndSecondToLast,
  type RowData,
} from '../data.mjs';

/**
 * The table as SPEC.md has an application write it: the rows are one immutable
 * array in a state, and `For` derives each row's value from it.
 */
export const synstateDom: Framework = {
  name: 'synstate-dom',
  mount: (container) => {
    const factory = createRowFactory();

    const [rows$, setRows, { getSnapshot: getRows }] = createState<
      readonly RowData[]
    >([]);

    const [selected$, setSelected] = createState<number | undefined>(undefined);

    const App = (): JSX.Element => (
      <table>
        <tbody>
          <For items={rows$} key={(row) => row.id}>
            {(row$) => {
              const { id } = row$.getSnapshot().value;

              return (
                <tr class={{ danger: view(selected$, (s) => s === id) }}>
                  <td>{constant(id)}</td>
                  <td>{view(row$, (row) => row.label)}</td>
                </tr>
              );
            }}
          </For>
        </tbody>
      </table>
    );

    const unmount = render(App, container);

    return {
      run: (count) => {
        setRows(factory.build(count));
      },
      add: (count) => {
        setRows([...getRows(), ...factory.build(count)]);
      },
      update: () => {
        setRows(
          getRows().map((row, i) =>
            i % 10 === 0 ? { ...row, label: `${row.label} !!!` } : row,
          ),
        );
      },
      select: (index) => {
        setSelected(getRows()[index]?.id);
      },
      swapRows: () => {
        setRows(swapSecondAndSecondToLast(getRows()));
      },
      remove: (index) => {
        setRows(getRows().toSpliced(index, 1));
      },
      clear: () => {
        setRows([]);
      },
      dispose: unmount,
    } satisfies BenchApp;
  },
} as const;
