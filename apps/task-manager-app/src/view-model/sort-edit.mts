/**
 * Editing a list of sort keys, first one deciding — what the sort editor
 * (`components/sort-editor.tsx`) offers, for the list's settings
 * (`list-settings.mts`) and for the order of 「アーク」 and 「タイル」
 * (`diagram-sort.mts`) alike. A key is in the list at most once, and the
 * list may be empty.
 */

import { Arr } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  sortKeys,
  type SortKey,
  type SortOrder,
  type SortSpec,
} from '../domain/index.mjs';

export const sortKeyLabels = {
  title: 'タイトル',
  dueDate: '期限',
  priority: '優先度',
  status: '状態',
  depth: '依存の深さ',
  createdAt: '作成日時',
  updatedAt: '更新日時',
  estimate: '見積',
} as const satisfies ReadonlyRecord<SortKey, string>;

export const sortOrderLabels = {
  asc: '昇順',
  desc: '降順',
} as const satisfies ReadonlyRecord<SortOrder, string>;

/** Appends `key`, ascending, unless it is already a sort key. */
export const addSortKey = (
  sort: readonly SortSpec[],
  key: SortKey,
): readonly SortSpec[] =>
  sort.some((spec) => spec.key === key)
    ? sort
    : Arr.toPushed(sort, { key, order: 'asc' });

export const removeSortKey = (
  sort: readonly SortSpec[],
  index: number,
): readonly SortSpec[] => sort.filter((_, i) => i !== index);

/** Swaps the key at `index` with the one `delta` (±1) away, if there is one. */
export const moveSortKey = (
  sort: readonly SortSpec[],
  index: number,
  delta: -1 | 1,
): readonly SortSpec[] => {
  const moved = sort[index];

  const other = sort[index + delta];

  if (moved === undefined || other === undefined) {
    return sort;
  }

  return sort.map((spec, i) =>
    i === index ? other : i === index + delta ? moved : spec,
  );
};

export const toggleSortOrder = (
  sort: readonly SortSpec[],
  index: number,
): readonly SortSpec[] =>
  sort.map((spec, i) =>
    i === index
      ? { key: spec.key, order: spec.order === 'asc' ? 'desc' : 'asc' }
      : spec,
  );

/** The keys that can still be added, in the order of `sortKeys`. */
export const unusedSortKeys = (sort: readonly SortSpec[]): readonly SortKey[] =>
  sortKeys.filter((key) => sort.every((spec) => spec.key !== key));

/** `sort` with the first of each key only: for what is read back. */
export const uniqueSortKeys = (
  sort: readonly SortSpec[],
): readonly SortSpec[] => Arr.uniqBy(sort, ({ key }) => key);

/** What the sort editor does to the keys it shows. */
export type SortKeyActions = Readonly<{
  addKey: (key: SortKey) => void;
  removeKey: (index: number) => void;
  moveKey: (index: number, delta: -1 | 1) => void;
  toggleOrder: (index: number) => void;
}>;

/** The editor's actions, each an edit of the keys `update` holds. */
export const sortKeyActions = (
  update: (edit: (sort: readonly SortSpec[]) => readonly SortSpec[]) => void,
): SortKeyActions =>
  ({
    addKey: (key) => {
      update((sort) => addSortKey(sort, key));
    },
    removeKey: (index) => {
      update((sort) => removeSortKey(sort, index));
    },
    moveKey: (index, delta) => {
      update((sort) => moveSortKey(sort, index, delta));
    },
    toggleOrder: (index) => {
      update((sort) => toggleSortOrder(sort, index));
    },
  }) as const;

/** A list of sort keys as stored, for validating what is read back. */
export const SortSpecsType = t.array(
  t.record({
    key: t.enumType(sortKeys),
    order: t.enumType(['asc', 'desc']),
  }),
);
