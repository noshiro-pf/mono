/**
 * The order of the tasks of 「アーク」 and 「タイル」 — one for both, apart
 * from the list's (`list-settings.mts`) — and how it is kept in `localStorage`
 * between visits, on this device only. Edited with the same
 * editor as the list's keys (`sort-edit.mts`) in 「表示設定」.
 *
 * Every key may be removed: no keys orders by title ascending, the default.
 * Kept as every setting is (`persisted-setting.mts`), its broken entries
 * dropped as `storedSortCodec` says.
 */

import { Arr } from 'ts-data-forge';
import type { SortSpec } from '../domain/index.mjs';
import { persistedSetting } from './persisted-setting.mjs';
import {
  storedSortCodec,
  TITLE_ASCENDING,
  uniqueSortKeys,
} from './sort-edit.mjs';

export const DiagramSortCodec = storedSortCodec(TITLE_ASCENDING);

/** By title, and what no keys at all means. */
export const DEFAULT_DIAGRAM_SORT: readonly SortSpec[] =
  DiagramSortCodec.defaultValue;

export const diagramSortStorage = persistedSetting(DiagramSortCodec, {
  key: 'task-manager-app:diagram-sort',
  normalize: uniqueSortKeys,
});

/** The keys the diagrams sort by: `sort`, or the default for none. */
export const effectiveDiagramSort = (
  sort: readonly SortSpec[],
): readonly SortSpec[] => (Arr.isEmpty(sort) ? DEFAULT_DIAGRAM_SORT : sort);
