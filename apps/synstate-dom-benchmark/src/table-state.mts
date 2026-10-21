import type { BenchApp } from './bench-app.mjs';
import {
  createRowFactory,
  swapSecondAndSecondToLast,
  type RowData,
} from './data.mjs';

/** The whole table as one immutable value, for the virtual-DOM libraries. */
export type TableState = Readonly<{
  rows: readonly RowData[];
  selected: number | undefined;
}>;

export const emptyTable: TableState = {
  rows: [],
  selected: undefined,
} as const;

/**
 * The operations over a {@link TableState}: each one computes the next state
 * from the last and hands it to `commit`, which re-renders. React and Preact
 * share it, so that they differ only in how they render.
 */
export const createTableOperations = (
  commit: (state: TableState) => void,
  dispose: () => void,
): BenchApp => {
  const factory = createRowFactory();

  const mut_current: { state: TableState } = { state: emptyTable };

  const set = (state: TableState): void => {
    mut_current.state = state;

    commit(state);
  };

  const withRows = (rows: readonly RowData[]): TableState =>
    ({
      rows,
      selected: mut_current.state.selected,
    }) as const;

  return {
    run: (count) => {
      set(withRows(factory.build(count)));
    },
    add: (count) => {
      set(withRows([...mut_current.state.rows, ...factory.build(count)]));
    },
    update: () => {
      set(
        withRows(
          mut_current.state.rows.map((row, i) =>
            i % 10 === 0 ? { ...row, label: `${row.label} !!!` } : row,
          ),
        ),
      );
    },
    select: (index) => {
      set({
        rows: mut_current.state.rows,
        selected: mut_current.state.rows[index]?.id,
      });
    },
    swapRows: () => {
      set(withRows(swapSecondAndSecondToLast(mut_current.state.rows)));
    },
    remove: (index) => {
      set(withRows(mut_current.state.rows.toSpliced(index, 1)));
    },
    clear: () => {
      set(withRows([]));
    },
    dispose,
  };
};
