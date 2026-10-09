/**
 * The order of the tasks of 「アーク」 and 「タイル」 — one for both, apart
 * from the list's (`list-settings.mts`) — and how it is kept in
 * `localStorage` between visits, on this device only. Edited with the same
 * editor as the list's keys (`sort-edit.mts`) in 「表示設定」.
 *
 * Every key may be removed: no keys orders by title ascending, the default.
 * Validated on read as the list settings are: anything that is not a list of
 * sort keys gives the default.
 */

import { Arr, Json, Result } from 'ts-data-forge';
import { type SortSpec } from '../domain/index.mjs';
import { SortSpecsType, uniqueSortKeys } from './sort-edit.mjs';

export const DIAGRAM_SORT_STORAGE_KEY = 'task-manager-app:diagram-sort';

/** By title, and what no keys at all means. */
export const DEFAULT_DIAGRAM_SORT: readonly SortSpec[] = [
  { key: 'title', order: 'asc' },
] as const;

/** The stored order, or the default when there is none to read. */
export const parseDiagramSort = (
  stored: string | null,
): readonly SortSpec[] => {
  if (stored === null) {
    return DEFAULT_DIAGRAM_SORT;
  }

  const parsed = Result.flatMap(Json.parse(stored), (json) =>
    SortSpecsType.validate(json),
  );

  return Result.isOk(parsed)
    ? uniqueSortKeys(parsed.value)
    : DEFAULT_DIAGRAM_SORT;
};

export const serializeDiagramSort = (sort: readonly SortSpec[]): string =>
  JSON.stringify(sort);

/** The keys the diagrams sort by: `sort`, or the default for none. */
export const effectiveDiagramSort = (
  sort: readonly SortSpec[],
): readonly SortSpec[] => (Arr.isEmpty(sort) ? DEFAULT_DIAGRAM_SORT : sort);
