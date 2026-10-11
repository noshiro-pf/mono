/**
 * How the list is shown — the sort keys (edited as `sort-edit.mts` says),
 * and whether done tasks are hidden — and how that is kept in
 * `localStorage` between visits.
 *
 * Every app under `noshiro-pf.github.io` shares that storage, hence the
 * prefixed key. What is read back is validated, and anything that is not
 * settings (an older format, a hand edit) gives the defaults rather than an
 * error: these are preferences, not data.
 */

import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { DeepReadonly } from 'ts-type-forge';
import type { SortSpec } from '../domain/index.mjs';
import { SortSpecsType, uniqueSortKeys } from './sort-edit.mjs';

export const LIST_SETTINGS_STORAGE_KEY = 'task-manager-app:list-settings';

export const DEFAULT_LIST_SETTINGS: ListSettings = {
  sort: [
    { key: 'status', order: 'asc' },
    { key: 'priority', order: 'asc' },
    { key: 'dueDate', order: 'asc' },
  ],
  hideDone: false,
} as const;

/** The stored settings, or the defaults when there are none to read. */
export const parseListSettings = (stored: string | null): ListSettings => {
  if (stored === null) {
    return DEFAULT_LIST_SETTINGS;
  }

  const parsed = Result.flatMap(Json.parse(stored), (json) =>
    ListSettingsType.validate(json),
  );

  return Result.isOk(parsed)
    ? {
        sort: uniqueSortKeys(parsed.value.sort),
        hideDone: parsed.value.hideDone,
      }
    : DEFAULT_LIST_SETTINGS;
};

export const serializeListSettings = (settings: ListSettings): string =>
  JSON.stringify(settings);

export type ListSettings = DeepReadonly<{
  sort: SortSpec[];
  hideDone: boolean;
}>;

const ListSettingsType = t.record({
  sort: SortSpecsType,
  hideDone: t.boolean(),
});
