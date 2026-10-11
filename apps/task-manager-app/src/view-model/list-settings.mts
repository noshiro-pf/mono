/**
 * How the list is shown — the sort keys (edited as `sort-edit.mts` says),
 * and whether done tasks are hidden — and how that is kept in
 * `localStorage` between visits, on this device only.
 *
 * Kept as every setting is (`persisted-setting.mts`): anything stored that
 * is not settings gives the defaults, and settings that are partly broken
 * keep what is fine — a sort that is not a list falls back to the default
 * sort and leaves hide-done as it was, and the other way round.
 */

import * as t from 'ts-fortress';
import { persistedSetting } from './persisted-setting.mjs';
import { SortSpecCodec, uniqueSortKeys } from './sort-edit.mjs';

export const ListSettingsCodec = t.record({
  sort: t.array(SortSpecCodec, {
    defaultValue: [
      { key: 'status', order: 'asc' },
      { key: 'priority', order: 'asc' },
      { key: 'dueDate', order: 'asc' },
    ] as const,
  }),
  hideDone: t.boolean(false),
});

export type ListSettings = t.TypeOf<typeof ListSettingsCodec>;

export const DEFAULT_LIST_SETTINGS: ListSettings =
  ListSettingsCodec.defaultValue;

export const listSettingsStorage = persistedSetting(ListSettingsCodec, {
  key: 'task-manager-app:list-settings',
  normalize: ({ sort, hideDone }) => ({ sort: uniqueSortKeys(sort), hideDone }),
});
