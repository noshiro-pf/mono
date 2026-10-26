import {
  createInitializedSyncChildObservable,
  createScope,
  getCurrentScope,
  map,
  onScopeDispose,
  type InitializedObservable,
  type Observable,
  type Scope,
} from 'synstate';
import { Arr, Optional } from 'ts-data-forge';
import type { BivariantHack } from 'ts-type-forge';
import { toObservable, type Bindable } from '../constant/index.mjs';
import { bindValue } from '../internal/index.mjs';
import { mountable, toNodes, type JSX } from '../jsx/index.mjs';
import { longestIncreasingSubsequence } from './longest-increasing-subsequence.mjs';

/**
 * Mounts one row per element of `items`, matched across updates by `key`
 * (SPEC.md 8.4).
 *
 * `children` is called once per key, inside a scope of the row's own, with
 * observables of the element and its index. The index is made only for a
 * `children` that declares a second parameter (`children.length >= 2`); one
 * that reads it otherwise, through a rest parameter or `arguments`, is given
 * `undefined`.
 *
 * A row whose key stays is not rebuilt: its `item$` and `index$` are derived
 * from `items`, so they update in the ordinary propagation, and nothing is
 * written during it. A key that goes disposes its row's scope and removes its
 * nodes; the rows that stay are moved as little as the longest increasing
 * subsequence allows.
 *
 * `key` is required, as in React; `(_, i) => i` matches rows by position. A
 * key that appears twice is reported with `console.error`, and its later
 * occurrences are rebuilt on every update.
 */
export const For = <T,>({
  items,
  key,
  children,
}: Readonly<{
  items: Bindable<readonly T[]>;
  key: (item: T, index: number) => unknown;
  children: (
    item$: InitializedObservable<T>,
    index$: InitializedObservable<number>,
  ) => JSX.Element;
}>): JSX.Element =>
  mountable(() => {
    const parent = getCurrentScope();

    const anchor = document.createComment('');

    const entries$ = toObservable(items).pipe(
      map((list) => toEntries(list, key)),
    );

    // `index$` is a node of its own in every row, visited on every update of
    // `items`; a `children` that declares no second parameter is not given
    // one, as Solid's `For` does.
    const usesIndex = children.length >= 2;

    const callChildren: BivariantHack<
      (
        item$: InitializedObservable<T>,
        index$?: InitializedObservable<number>,
      ) => JSX.Element
    > = children;

    const mut_rows = new Map<unknown, Row>();

    const rowStarts = new WeakSet<Node>();

    const mut_initial: { nodes: readonly ChildNode[] } = { nodes: [] };

    /** Creates a row in a scope of its own and returns its first nodes. */
    const createRow = (
      rowKey: unknown,
      entry: Entry<T>,
    ): readonly ChildNode[] => {
      const scope = createScope(parent);

      const start = document.createComment('');

      rowStarts.add(start);

      const nodes = scope.run(() => {
        const item$ = rowField(entries$, rowKey, entry.item, (e) => e.item);

        return toNodes(
          (usesIndex
            ? callChildren(
                item$,
                rowField(entries$, rowKey, entry.index, (e) => e.index),
              )
            : callChildren(item$)
          ).mount(),
        );
      });

      const row: Row = { scope, start } as const;

      scope.run(() => {
        onScopeDispose(() => {
          for (const node of rowNodes(row)) {
            node.remove();
          }
        });
      });

      mut_rows.set(rowKey, row);

      return Arr.toUnshifted(start)(nodes);
    };

    /** The row's current nodes: from its start to the next row or the anchor. */
    const rowNodes = (row: Row): readonly ChildNode[] => {
      const mut_nodes: ChildNode[] = [row.start];

      for (
        let mut_node = row.start.nextSibling;
        mut_node !== null && mut_node !== anchor && !rowStarts.has(mut_node);
        mut_node = mut_node.nextSibling
      ) {
        mut_nodes.push(mut_node);
      }

      return mut_nodes;
    };

    /**
     * When no key stays, takes every row's nodes out in one range, rather than
     * one by one as each row's scope is disposed: clearing or replacing the
     * whole list is then one DOM operation. The scopes are disposed after,
     * and find their nodes already detached.
     */
    const removeAllAtOnceIfEveryKeyGoes = (
      previousOrder: readonly unknown[],
      entries: Entries<T>,
    ): void => {
      if (
        !Arr.isNonEmpty(previousOrder) ||
        previousOrder.some((rowKey) => entries.byKey.has(rowKey))
      ) {
        return;
      }

      const first = mut_rows.get(previousOrder[0]);

      if (first === undefined) {
        return;
      }

      const range = document.createRange();

      range.setStartBefore(first.start);

      range.setEndBefore(anchor);

      range.deleteContents();
    };

    bindValue(entries$, (entries) => {
      const previousOrder = Array.from(mut_rows.keys());

      if (anchor.parentNode !== null) {
        removeAllAtOnceIfEveryKeyGoes(previousOrder, entries);
      }

      for (const [rowKey, row] of mut_rows) {
        if (entries.byKey.has(rowKey)) {
          continue;
        }

        row.scope.dispose();

        mut_rows.delete(rowKey);
      }

      if (anchor.parentNode === null) {
        mut_initial.nodes = entries.order.flatMap((rowKey) => {
          const entry = entries.byKey.get(rowKey);

          return entry === undefined ? [] : createRow(rowKey, entry);
        });

        return;
      }

      if (Arr.eq(previousOrder, entries.order)) {
        return;
      }

      const previousPosition = new Map(
        previousOrder
          .filter((rowKey) => mut_rows.has(rowKey))
          .map((rowKey, position) => [rowKey, position]),
      );

      const positions = entries.order.map(
        (rowKey) => previousPosition.get(rowKey) ?? -1,
      );

      const stay = longestIncreasingSubsequence(
        positions.filter((position) => position >= 0),
      );

      const staying = new Set(
        positions
          .filter((position) => position >= 0)
          .filter((_, k) => stay.has(k)),
      );

      let mut_next: ChildNode = anchor;

      for (const rowKey of entries.order.toReversed()) {
        const existing = mut_rows.get(rowKey);

        if (existing === undefined) {
          const entry = entries.byKey.get(rowKey);

          if (entry === undefined) {
            continue;
          }

          const [start, ...rest] = createRow(rowKey, entry);

          if (start !== undefined) {
            mut_next.before(start, ...rest);

            mut_next = start;
          }

          continue;
        }

        if (!staying.has(previousPosition.get(rowKey) ?? -1)) {
          mut_next.before(...rowNodes(existing));
        }

        mut_next = existing.start;
      }

      reorderMap(mut_rows, entries.order);
    });

    return Arr.toPushed(mut_initial.nodes, anchor);
  });

type Row = Readonly<{
  /** The row's own scope, a child of the scope `For` was mounted in. */
  scope: Scope;
  /** A comment in front of the row's nodes, which do not otherwise stay put: a switch at the top of the row changes them. */
  start: Comment;
}>;

type Entry<T> = Readonly<{ item: T; index: number }>;

type Entries<T> = Readonly<{
  order: readonly unknown[];
  byKey: ReadonlyMap<unknown, Entry<T>>;
}>;

const toEntries = <T,>(
  list: readonly T[],
  key: (item: T, index: number) => unknown,
): Entries<T> => {
  const mut_byKey = new Map<unknown, Entry<T>>();

  const order = list.map((item, index) => {
    const itemKey = key(item, index);

    if (!mut_byKey.has(itemKey)) {
      mut_byKey.set(itemKey, { item, index });

      return itemKey;
    }

    console.error(
      'synstate-dom: For found the key',
      itemKey,
      'more than once; keys must be unique.',
    );

    // A fresh key: the duplicate is rebuilt on every update.
    const duplicateKey = Symbol('duplicate key');

    mut_byKey.set(duplicateKey, { item, index });

    return duplicateKey;
  });

  return { order, byKey: mut_byKey };
};

/**
 * One field of a row's entry, as a single child of `entries$`, where
 * `map`, `filter`, `withInitialValue` and `skipIfNoChange` would make four:
 * creating and disposing a row costs roughly its number of nodes.
 *
 * A row whose key has gone keeps its last value; its scope is disposed in
 * the same update.
 */
const rowField = <T, A>(
  entries$: Observable<Entries<T>>,
  rowKey: unknown,
  initialValue: A,
  field: (entry: Entry<T>) => A,
): InitializedObservable<A> =>
  createInitializedSyncChildObservable(
    { parents: [entries$], initialValue: Optional.some(initialValue) },
    ({ setNext }) => {
      let mut_previous = initialValue;

      return (updateToken) => {
        const sn = entries$.getSnapshot();

        if (entries$.updateToken !== updateToken || Optional.isNone(sn)) {
          return;
        }

        const entry = sn.value.byKey.get(rowKey);

        if (entry === undefined) {
          return;
        }

        const next = field(entry);

        if (Object.is(next, mut_previous)) {
          return;
        }

        mut_previous = next;

        setNext(next, updateToken);
      };
    },
  );

/** Re-inserts the rows in the new order, so that iteration follows the DOM. */
const reorderMap = (
  mut_rows: Map<unknown, Row>,
  order: readonly unknown[],
): void => {
  const rows = Arr.generate(function* () {
    for (const rowKey of order) {
      const row = mut_rows.get(rowKey);

      if (row !== undefined) {
        yield [rowKey, row] as const;
      }
    }
  });

  mut_rows.clear();

  for (const [rowKey, row] of rows) {
    mut_rows.set(rowKey, row);
  }
};
