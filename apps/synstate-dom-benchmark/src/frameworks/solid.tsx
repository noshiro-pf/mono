/** @jsxImportSource solid-js */
import {
  batch,
  createRoot,
  createSelector,
  createSignal,
  For,
  type Accessor,
  type Setter,
} from 'solid-js';
import type { BenchApp, Framework } from '../bench-app.mjs';
import { createRowFactory, swapSecondAndSecondToLast } from '../data.mjs';

type SolidRow = Readonly<{
  id: number;
  label: Accessor<string>;
  setLabel: Setter<string>;
}>;

/**
 * Solid as js-framework-benchmark's keyed implementation writes it: a signal
 * per label, `For` over the row objects, and `createSelector` for the
 * selection, so that selecting touches two rows only.
 */
export const solid: Framework = {
  name: 'Solid',
  mount: (container) =>
    createRoot((dispose) => {
      const factory = createRowFactory();

      const [rows, setRows] = createSignal<readonly SolidRow[]>([]);

      const [selected, setSelected] = createSignal<number | undefined>(
        undefined,
      );

      const isSelected = createSelector(selected);

      const build = (count: number): readonly SolidRow[] =>
        factory.build(count).map(({ id, label }) => {
          const [get, set] = createSignal(label);

          return { id, label: get, setLabel: set };
        });

      const element = (
        <table>
          <tbody>
            <For each={rows()}>
              {(row) => (
                <tr class={isSelected(row.id) ? 'danger' : ''}>
                  <td>{row.id}</td>
                  <td>{row.label()}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      );

      // A `<table>` expression is a `HTMLTableElement` at run time; Solid
      // types every JSX expression as its broader `JSX.Element`.
      if (element instanceof Node) {
        container.append(element);
      }

      return {
        run: (count) => {
          setRows(build(count));
        },
        add: (count) => {
          setRows([...rows(), ...build(count)]);
        },
        update: () => {
          batch(() => {
            for (const [i, row] of rows().entries()) {
              if (i % 10 === 0) {
                row.setLabel((label) => `${label} !!!`);
              }
            }
          });
        },
        select: (index) => {
          setSelected(rows()[index]?.id);
        },
        swapRows: () => {
          setRows(swapSecondAndSecondToLast(rows()));
        },
        remove: (index) => {
          setRows(rows().toSpliced(index, 1));
        },
        clear: () => {
          setRows([]);
        },
        dispose: () => {
          dispose();

          container.replaceChildren();
        },
      } satisfies BenchApp;
    }),
} as const;
