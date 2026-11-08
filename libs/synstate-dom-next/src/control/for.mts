import {
  isObservable,
  state,
  type InitializedObservable,
  type Owner,
  type State,
} from 'synstate-next';
import {
  DrainCheck,
  EffectClass,
  disposeEach,
  keepFirst,
  keepFirstOf,
  noValue,
  retireOwner,
  throwFailure,
  toNode,
  type Failure,
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
import { MountSite, removeRange } from './branch.mjs';
import { longestIncreasingRun } from './longest-increasing-run.mjs';

/**
 * Mounts one row per element of `items`, matched across updates by `key`.
 *
 * `children` is called once per key, in an owner of the row's own, with an
 * observable of the element and one of its index. The index is a node of its
 * own in every row, so it is made only for a `children` that declares a second
 * parameter, as `Function.length` counts it: one that reads it through a
 * default value or a rest parameter is given none.
 *
 * Once every value of an update of `items` is up to date, a row whose key stays
 * is not rebuilt: the state behind its `item` is set to the new element, which
 * reaches only what reads it, and its index likewise. When the keys are the
 * same in the same order, that is all that happens. Otherwise a key that went
 * disposes its row and removes its nodes, a new key mounts a row, and the rows
 * that stay are moved as little as the longest increasing run of their old
 * positions allows.
 *
 * The writes to the rows' states start an update of their own, after the one
 * that changed `items`: a row reads its new element one update later than
 * `items` changed, and before anything is painted.
 *
 * A row whose key goes never computes from the list that drops it: the keys are
 * checked while values are recomputed, above the rows' nodes, and the rows that
 * go are taken out of the update there.
 *
 * `key` is required; `(_, i) => i` matches rows by position. A key that appears
 * twice is reported with `console.error`.
 *
 * A row's cleanup that throws stops neither the other disposals nor the update:
 * the exception is thrown once the rows are in place. A row that throws while
 * mounting takes out the rows the update made and keeps the others, in the
 * order they are in; the next update puts them right.
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
    const binding = isObservable(items)
      ? new ForBinding(toNode(items), key, children, true)
      : // A list that never changes: a node of its own that is never written,
        // with nothing to check.
        new ForBinding(toNode(state(items)), key, children, false);

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
  /** The last check (see `#retireDropped`) that found the row's key. */
  seenIn: number;
  /** Whether the row was retired; it goes in the next update, whatever comes. */
  retired: boolean;
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

  readonly #site: MountSite;

  readonly #mut_byKey: Map<unknown, Row<T>>;

  #mut_rows: readonly Row<T>[];

  /** Counts the updates that changed the keys. */
  #mut_generation: number;

  /** Counts the calls of `#retireDropped`. */
  #mut_checks: number;

  /** How many rows are retired; they all go in the next update. */
  #mut_retiredRows: number;

  /** The list the drain checked, whose keys the effect does not compute again. */
  #mut_checkedList: readonly T[] | undefined;

  /**
   * The keys of `#mut_checkedList`, or `undefined` when they are the rows'
   * keys, in order. Written with it, by `#setChecked`.
   */
  #mut_checkedKeys: readonly unknown[] | undefined;

  /** Undefined for a list that never changes. */
  readonly #check: DrainCheck | undefined;

  /** The least depth of a row's nodes; see `DrainCheck`. */
  readonly #rowDepth: number;

  constructor(
    source: ObservableClass<readonly T[]>,
    key: (item: T, index: number) => unknown,
    children: (
      item: InitializedObservable<T>,
      index: InitializedObservable<number>,
    ) => Description,
    changes: boolean,
  ) {
    super(source);

    this.#start = document.createComment('');

    this.#end = document.createComment('');

    this.#key = key;

    this.#children = children;

    this.#usesIndex = children.length >= 2;

    this.#site = new MountSite();

    this.#mut_byKey = new Map<unknown, Row<T>>();

    this.#mut_rows = [];

    this.#mut_generation = 0;

    this.#mut_checks = 0;

    this.#mut_retiredRows = 0;

    this.#mut_checkedList = undefined;

    this.#mut_checkedKeys = undefined;

    this.#check = changes ? this.#checkInDrain(source) : undefined;

    this.#rowDepth = this.#check?.branchDepth ?? 0;
  }

  /** Makes the check of `#retireDropped`. */
  #checkInDrain(source: ObservableClass<readonly T[]>): DrainCheck {
    return new DrainCheck(
      source,
      () => {
        this.#retireDropped();
      },
      () => {
        // A list whose keys cannot be told keeps no row; `run` removes them.
        this.#retireRows(-1);
      },
    );
  }

  #setChecked(
    list: readonly T[] | undefined,
    keys: readonly unknown[] | undefined,
  ): void {
    this.#mut_checkedList = list;

    this.#mut_checkedKeys = keys;
  }

  /**
   * Called in the drain when the list emits: retires the rows whose key the new
   * list does not have, before the drain reaches them.
   */
  #retireDropped(): void {
    const list = this.#list();

    // Cleared first: `key` may throw.
    this.#setChecked(undefined, undefined);

    const keys = this.#keysUnlessSame(list, this.#mut_rows);

    this.#setChecked(list, keys);

    if (keys === undefined) {
      return;
    }

    this.#mut_checks += 1;

    const check = this.#mut_checks;

    for (const key of keys) {
      const row = this.#mut_byKey.get(key);

      if (row !== undefined) {
        row.seenIn = check;
      }
    }

    this.#retireRows(check);
  }

  /** Retires the rows not seen in the check numbered `check`. */
  #retireRows(check: number): void {
    for (const row of this.#mut_rows) {
      if (row.seenIn === check || row.retired) {
        continue;
      }

      row.retired = true;

      this.#mut_retiredRows += 1;

      retireOwner(row.owner);
    }
  }

  #list(): readonly T[] {
    const list = this.source.current;

    return list === noValue ? [] : list;
  }

  /**
   * The keys of `list`, or `undefined` when they are those of `rows`, in order,
   * and no row is retired. Calls `key` once per item.
   */
  #keysUnlessSame(
    list: readonly T[],
    rows: readonly Row<T>[],
  ): readonly unknown[] | undefined {
    if (this.#mut_retiredRows > 0 || list.length !== rows.length) {
      return list.map((item, i) => this.#key(item, i));
    }

    for (const [i, row] of rows.entries()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the lengths are equal
      const key = this.#key(list[i]!, i);

      if (row.key !== key) {
        // The keys before `i` are the rows'.
        return list.map((item, j) =>
          j < i
            ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the lengths are equal
              rows[j]!.key
            : j === i
              ? key
              : this.#key(item, j),
        );
      }
    }

    return undefined;
  }

  #createRow(item: T, i: number, key: unknown, out: MountedNodes): Row<T> {
    const start = out.list.length;

    const owner = this.#site.newOwner(this.#rowDepth);

    const [itemState, indexState] = this.#site.run(owner, () => {
      const itemInRow = state(item);

      const indexInRow = this.#usesIndex ? state(i) : undefined;

      // Called with one argument when it declares one, so that a rest parameter
      // sees no index.
      (indexInRow === undefined
        ? this.#children(itemInRow)
        : this.#children(itemInRow, indexInRow)
      ).mount(out);

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
      seenIn: this.#mut_checks,
      retired: false,
    } as const;

    if (this.#mut_byKey.has(key)) {
      console.error('synstate-dom-next: For was given a duplicate key:', key);
    }

    this.#mut_byKey.set(key, row);

    return row;
  }

  /**
   * Takes every row out, then disposes them, as a row's own removal comes
   * before its cleanups. When the markers and the rows are all the parent
   * holds, `textContent` empties it in one step; otherwise a range does.
   * Returns what a cleanup threw; see `disposeEach`.
   */
  #removeAll(): Failure {
    const rows = this.#mut_rows;

    if (Arr.isEmpty(rows)) {
      return undefined;
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

    this.#mut_byKey.clear();

    this.#mut_rows = [];

    this.#mut_retiredRows = 0;

    return disposeEach(rows.map((row) => row.owner));
  }

  /**
   * Takes out the rows of `previous` that `generation` did not keep, then
   * disposes them. Returns what a cleanup threw; see `disposeEach`.
   */
  #removeGone(previous: readonly Row<T>[], generation: number): Failure {
    const gone = previous.filter((row) => row.keptIn !== generation);

    if (gone.length === previous.length) {
      return this.#removeAll();
    }

    for (const row of gone) {
      removeRange(row.first, row.last);

      if (this.#mut_byKey.get(row.key) === row) {
        this.#mut_byKey.delete(row.key);
      }
    }

    // A retired row is never kept, so none is left.
    this.#mut_retiredRows = 0;

    return disposeEach(gone.map((row) => row.owner));
  }

  /**
   * Puts the rows of `list` in order: `next` holds the kept ones at their new
   * positions, and the others are mounted. Returns the rows.
   */
  #place(
    list: readonly T[],
    keys: readonly unknown[],
    next: readonly (Row<T> | undefined)[],
    generation: number,
  ): readonly Row<T>[] {
    // The kept rows on a longest increasing run of old positions stay put; the
    // others move, from the end, before the row after them.
    const stay = longestIncreasingRun(
      next.map((row) => (row === undefined ? -1 : row.position)),
    );

    const mut_rows: Row<T>[] = Array.from({ length: list.length });

    try {
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
          const row = this.#createRow(list[mut_j]!, mut_j, keys[mut_j], out);

          row.keptIn = generation;

          mut_rows[mut_j] = row;
        }

        out.insertBefore(mut_before);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- made above
        mut_before = mut_rows[mut_start]!.first;

        mut_i = mut_start - 1;
      }
    } catch (error) {
      // A row that threw while mounting: the rows made in this update go, and
      // the kept ones stay, in the order they are in now.
      const removal = this.#keepOnly(next, mut_rows);

      if (removal !== undefined) {
        console.error(removal.error);
      }

      throw error;
    }

    return mut_rows;
  }

  /**
   * After a row threw while mounting, takes out and disposes the rows `placed`
   * holds that `next` does not, the rows made in this update, and keeps the
   * rows of `next`, in the order their nodes are in. Returns what a cleanup
   * threw; see `disposeEach`.
   */
  #keepOnly(
    next: readonly (Row<T> | undefined)[],
    placed: readonly (Row<T> | undefined)[],
  ): Failure {
    // `filter` skips the holes of `placed`: the positions not reached.
    const made = placed.filter(
      (row, i): row is Row<T> => row !== undefined && next[i] === undefined,
    );

    for (const row of made) {
      removeRange(row.first, row.last);

      if (this.#mut_byKey.get(row.key) === row) {
        this.#mut_byKey.delete(row.key);
      }
    }

    const kept = next
      .filter((row) => row !== undefined)
      .toSorted((a, b) =>
        (a.first.compareDocumentPosition(b.first) &
          Node.DOCUMENT_POSITION_FOLLOWING) ===
        0
          ? 1
          : -1,
      );

    for (const [i, row] of kept.entries()) {
      row.position = i;

      // A made row with a repeated key took the kept row's place in the map.
      this.#mut_byKey.set(row.key, row);
    }

    this.#mut_rows = kept;

    return disposeEach(made.map((row) => row.owner));
  }

  mountInto(out: MountedNodes): void {
    const list = this.#list();

    out.push(this.#start);

    this.#mut_rows = list.map((item, i) =>
      this.#createRow(item, i, this.#key(item, i), out),
    );

    out.push(this.#end);
  }

  run(): void {
    const list = this.#list();

    const previous = this.#mut_rows;

    const keyFailure = this.#check?.takeFailure();

    if (keyFailure !== undefined) {
      // `key` threw in the drain, which retired every row: they go, and the
      // exception is this effect's.
      this.#setChecked(undefined, undefined);

      throwFailure(keepFirstOf(keyFailure, this.#removeAll()));

      return;
    }

    const checked = this.#mut_checkedList === list;

    const checkedKeys = this.#mut_checkedKeys;

    this.#setChecked(undefined, undefined);

    const keys = checked ? checkedKeys : this.#keysUnlessSame(list, previous);

    if (keys === undefined) {
      for (const [i, row] of previous.entries()) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- the lengths are equal
        row.item.set(list[i]!);
      }

      return;
    }

    if (Arr.isEmpty(list)) {
      // Every row is disposed even when one's cleanup throws.
      throwFailure(this.#removeAll());

      return;
    }

    this.#mut_generation += 1;

    const generation = this.#mut_generation;

    // The rows kept, at their new positions.
    const next = list.map((item, i): Row<T> | undefined => {
      const row = this.#mut_byKey.get(keys[i]);

      // A retired row computes nothing more: a new row takes its key.
      if (row === undefined || row.keptIn === generation || row.retired) {
        return undefined;
      }

      row.keptIn = generation;

      row.item.set(item);

      row.index?.set(i);

      return row;
    });

    // The rows that went are disposed before the new ones mount. A cleanup that
    // throws stops neither the other disposals nor the rest of the update: the
    // exception is thrown once the rows are in place.
    const failure = this.#removeGone(previous, generation);

    try {
      this.#mut_rows = this.#place(list, keys, next, generation);
    } catch (error) {
      throwFailure(keepFirst(failure, error));
    }

    throwFailure(failure);
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
