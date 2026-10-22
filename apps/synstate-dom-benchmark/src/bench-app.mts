/**
 * The operations of js-framework-benchmark, which every implementation under
 * `frameworks/` provides over the same table.
 *
 * `update` appends `' !!!'` to the label of every tenth row; `swapRows` swaps
 * the second and the second-to-last row. `select` and `remove` take the row's
 * position, so that the harness need not know the ids.
 */
export type BenchApp = Readonly<{
  run: (count: number) => void;
  add: (count: number) => void;
  update: () => void;
  select: (index: number) => void;
  swapRows: () => void;
  remove: (index: number) => void;
  clear: () => void;
  dispose: () => void;
}>;

export type Framework = Readonly<{
  name: string;
  /** Mounts an empty table into `container`. */
  mount: (container: HTMLElement) => BenchApp;
}>;
