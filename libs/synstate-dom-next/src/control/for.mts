import {
  getOwner,
  isObservable,
  Owner,
  state,
  type InitializedObservable,
  type State,
} from 'synstate-next';
import {
  EffectClass,
  noValue,
  toNode,
  type ObservableClass,
} from 'synstate-next/internal';
import * as Arr from 'ts-data-forge/array';
import type { BivariantHack } from 'ts-type-forge';
import type { Bindable } from '../constant.mjs';
import {
  ControlDescription,
  MountedNodes,
  type Description,
} from '../jsx/index.mjs';
import { removeRange } from './branch.mjs';
import { longestIncreasingRun } from './longest-increasing-run.mjs';

/**
 * Mounts one row per element of `items`, matched across updates by `key`.
 *
 * `children` is called once per key, in an owner of the row's own, with an
 * observable of the element and one of its index. The index is a node of its
 * own in every row, so it is made only for a `children` that declares a second
 * parameter, as `Function.length` counts it: one that reads it through a
 * default value or a rest parameter is given `undefined`.
 *
 * After an update of `items` has settled, a row whose key stays is not rebuilt:
 * the state behind its `item` is set to the new element, which wakes only what
 * reads it, and its index likewise. When the keys are the same in the same
 * order, that is all that happens. Otherwise a key that went disposes its row
 * and removes its nodes, a new key mounts a row, and the rows that stay are
 * moved as little as the longest increasing run of their old positions allows.
 *
 * The writes to the rows' states start an update of their own, after the one
 * that changed `items`: a row reads its new element one round later than
 * `items` changed, and before anything is painted.
 *
 * `key` is required; `(_, i) => i` matches rows by position. A key that appears
 * twice is reported with `console.error`.
 */
export const For = <T,>({
  items,
  key,
  children,
}: Readonly<{
  items: Bindable<readonly T[]>;
  key: (item: T, index: number) => unknown;
  children: (
    item: InitializedObservable<T>,
    index: InitializedObservable<number>,
  ) => Description;
}>): Description =>
  new ControlDescription((out) => {
    const source = isObservable(items)
      ? toNode(items)
      : // A list that never changes: a node of its own that is never written.
        toNode(state(items));

    const binding = new ForBinding(source, key, children);

    binding.mountInto(out);
  });

/** A mounted row; `position` and `keptIn` are written in place. */
// transformer-ignore-next-line convert-to-readonly
type Row<T> = {
  readonly key: unknown;
  readonly item: State<T>;
  readonly index: State<number> | undefined;
  readonly owner: Owner;
  /** The row's first and last nodes; a row with none has a comment. */
  readonly first: ChildNode;
  readonly last: ChildNode;
  /** The row's position before the update under way. */
  position: number;
  /** The last update that kept the row. */
  keptIn: number;
};

class ForBinding<T> extends EffectClass<readonly T[]> {
  /**
   * The rows are between `#start` and `#end`. The markers are what a row
   * holding a nested `For` or `If` starts or ends with, so a row's first and
   * last nodes never move or go while the row lives.
   */
  readonly #start: Comment;

  readonly #end: Comment;

  readonly #key: (item: T, index: number) => unknown;

  /** Called with no index unless it declares one; see `#usesIndex`. */
  readonly #children: BivariantHack<
    (
      item: InitializedObservable<T>,
      index?: InitializedObservable<number>,
    ) => Description
  >;

  readonly #usesIndex: boolean;

  readonly #parent: Owner | undefined;

  readonly #mut_byKey: Map<unknown, Row<T>>;

  #mut_rows: readonly Row<T>[];

  /** Counts the updates that changed the keys. */
  #mut_generation: number;

  constructor(
    source: ObservableClass<readonly T[]>,
    key: (item: T, index: number) => unknown,
    children: (
      item: InitializedObservable<T>,
      index: InitializedObservable<number>,
    ) => Description,
  ) {
    super(source);

    this.#start = document.createComment('');

    this.#end = document.createComment('');

    this.#key = key;

    this.#children = children;

    this.#usesIndex = children.length >= 2;

    this.#parent = getOwner();

    this.#mut_byKey = new Map<unknown, Row<T>>();

    this.#mut_rows = [];

    this.#mut_generation = 0;
  }

  #list(): readonly T[] {
    const list = this.source.current;

    return list === noValue ? [] : list;
  }

  #sameKeys(list: readonly T[], rows: readonly Row<T>[]): boolean {
    if (list.length !== rows.length) {
      return false;
    }

    for (const [i, row] of rows.entries()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the lengths are equal
      if (row.key !== this.#key(list[i]!, i)) {
        return false;
      }
    }

    return true;
  }

  #createRow(item: T, i: number, out: MountedNodes): Row<T> {
    const key = this.#key(item, i);

    const owner = new Owner(this.#parent);

    const start = out.list.length;

    const [itemState, indexState] = owner.run(() => {
      const itemInRow = state(item);

      const indexInRow = this.#usesIndex ? state(i) : undefined;

      this.#children(itemInRow, indexInRow).mount(out);

      return [itemInRow, indexInRow] as const;
    });

    if (out.list.length === start) {
      // An empty row still needs a place among the others.
      out.push(document.createComment(''));
    }

    const row: Row<T> = {
      key,
      item: itemState,
      index: indexState,
      owner,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the row has a node
      first: out.list[start]!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the row has a node
      last: out.list.at(-1)!,
      position: i,
      keptIn: this.#mut_generation,
    } as const;

    if (this.#mut_byKey.has(key)) {
      console.error('synstate-dom-next: For was given a duplicate key:', key);
    }

    this.#mut_byKey.set(key, row);

    return row;
  }

  #removeRow(row: Row<T>): void {
    row.owner.dispose();

    removeRange(row.first, row.last);

    if (this.#mut_byKey.get(row.key) === row) {
      this.#mut_byKey.delete(row.key);
    }
  }

  /**
   * Removes every row. When the markers and the rows are all the parent holds,
   * `textContent` empties it in one step; otherwise a range does.
   */
  #clear(): void {
    const rows = this.#mut_rows;

    if (Arr.isEmpty(rows)) {
      return;
    }

    const parent = this.#end.parentNode;

    if (parent === null) {
      for (const row of rows) {
        removeRange(row.first, row.last);
      }
    } else if (
      parent.firstChild === this.#start &&
      parent.lastChild === this.#end
    ) {
      parent.textContent = '';

      parent.append(this.#start, this.#end);
    } else {
      const range = document.createRange();

      range.setStartAfter(this.#start);

      range.setEndBefore(this.#end);

      range.deleteContents();
    }

    for (const row of rows) {
      row.owner.dispose();
    }

    this.#mut_byKey.clear();

    this.#mut_rows = [];
  }

  mountInto(out: MountedNodes): void {
    const list = this.#list();

    out.push(this.#start);

    this.#mut_rows = list.map((item, i) => this.#createRow(item, i, out));

    out.push(this.#end);
  }

  run(): void {
    const list = this.#list();

    const previous = this.#mut_rows;

    if (this.#sameKeys(list, previous)) {
      for (const [i, row] of previous.entries()) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the lengths are equal
        row.item.set(list[i]!);
      }

      return;
    }

    if (Arr.isEmpty(list)) {
      this.#clear();

      return;
    }

    this.#mut_generation += 1;

    const generation = this.#mut_generation;

    // The rows kept, at their new positions.
    const next = list.map((item, i): Row<T> | undefined => {
      const row = this.#mut_byKey.get(this.#key(item, i));

      if (row === undefined || row.keptIn === generation) {
        return undefined;
      }

      row.keptIn = generation;

      row.item.set(item);

      row.index?.set(i);

      return row;
    });

    if (previous.every((row) => row.keptIn !== generation)) {
      this.#clear();
    } else {
      for (const row of previous) {
        if (row.keptIn !== generation) {
          this.#removeRow(row);
        }
      }
    }

    // The kept rows on a longest increasing run of old positions stay put; the
    // others move, from the end, before the row after them.
    const stay = longestIncreasingRun(
      next.map((row) => (row === undefined ? -1 : row.position)),
    );

    const mut_rows: Row<T>[] = Array.from({ length: list.length });

    let mut_before: ChildNode = this.#end;

    let mut_i = list.length - 1;

    while (mut_i >= 0) {
      const kept = next[mut_i];

      if (kept !== undefined) {
        if (!stay.has(mut_i)) {
          moveRange(kept.first, kept.last, mut_before);
        }

        kept.position = mut_i;

        mut_rows[mut_i] = kept;

        mut_before = kept.first;

        mut_i -= 1;

        continue;
      }

      // A run of new rows, mounted in order and inserted in one step.
      let mut_start = mut_i;

      while (mut_start > 0 && next[mut_start - 1] === undefined) {
        mut_start -= 1;
      }

      const out = new MountedNodes();

      for (let mut_j = mut_start; mut_j <= mut_i; mut_j += 1) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- in range
        const row = this.#createRow(list[mut_j]!, mut_j, out);

        row.keptIn = generation;

        mut_rows[mut_j] = row;
      }

      out.insertBefore(mut_before);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- made above
      mut_before = mut_rows[mut_start]!.first;

      mut_i = mut_start - 1;
    }

    this.#mut_rows = mut_rows;
  }
}

/** Moves the nodes from `first` to `last`, both included, before `before`. */
const moveRange = (
  first: ChildNode,
  last: ChildNode,
  before: ChildNode,
): void => {
  let mut_node: ChildNode | null = first;

  while (mut_node !== null) {
    const next: ChildNode | null =
      mut_node === last ? null : mut_node.nextSibling;

    before.before(mut_node);

    mut_node = next;
  }
};
