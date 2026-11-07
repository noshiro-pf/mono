/** @jsxImportSource synstate-dom-next */
import { constant, For, render, selector, type JSX } from 'synstate-dom-next';
import { map, state } from 'synstate-next';
import type { BenchApp, Framework } from '../bench-app.mjs';
import {
  createRowFactory,
  swapSecondAndSecondToLast,
  type RowData,
} from '../data.mjs';

/**
 * The table as synstate-dom-next's README has an application write it: the rows
 * are one immutable array in a state, `For` keeps a state per row, and
 * `selector` writes only the rows whose selection changed.
 */
export const synstateDomNext: Framework = {
  name: 'synstate-dom-next',
  mount: (container) => {
    const factory = createRowFactory();

    const rows = state<readonly RowData[]>([]);

    const selected = state<number | undefined>(undefined);

    const App = (): JSX.Element => {
      const isSelected = selector(selected);

      return (
        <table>
          <tbody>
            <For items={rows} key={(row) => row.id}>
              {(row) => {
                const { id } = row.value;

                return (
                  <tr class={{ danger: isSelected.is(id) }}>
                    <td>{constant(id)}</td>
                    <td>{row.pipe(map((r) => r.label))}</td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      );
    };

    const unmount = render(App, container);

    return {
      run: (count) => {
        rows.set(factory.build(count));
      },
      add: (count) => {
        rows.set([...rows.value, ...factory.build(count)]);
      },
      update: () => {
        rows.set(
          rows.value.map((row, i) =>
            i % 10 === 0 ? { ...row, label: `${row.label} !!!` } : row,
          ),
        );
      },
      select: (index) => {
        selected.set(rows.value[index]?.id);
      },
      swapRows: () => {
        rows.set(swapSecondAndSecondToLast(rows.value));
      },
      remove: (index) => {
        rows.set(rows.value.toSpliced(index, 1));
      },
      clear: () => {
        rows.set([]);
      },
      dispose: unmount,
    } satisfies BenchApp;
  },
} as const;
