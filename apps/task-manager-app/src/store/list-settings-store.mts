/**
 * The list's sort keys and the done filter, saved whenever they change. What
 * each edit does is `view-model/sort-edit.mts`; this holds the current
 * settings.
 */

import { createState, type InitializedObservable } from 'synstate';
import {
  sortKeyActions,
  type ListSettings,
  type SortKeyActions,
} from '../view-model/index.mjs';

export type ListSettingsDeps = Readonly<{
  initial: ListSettings;
  save: (settings: ListSettings) => void;
}>;

export type ListSettingsStore = SortKeyActions &
  Readonly<{
    settings: InitializedObservable<ListSettings>;
    setHideDone: (hideDone: boolean) => void;
    /** Starts saving, and returns what stops it. */
    start: () => () => void;
  }>;

export const createListSettingsStore = (
  deps: ListSettingsDeps,
): ListSettingsStore => {
  const [settings, , { updateState }] = createState<ListSettings>(deps.initial);

  return {
    settings,
    ...sortKeyActions((edit) => {
      updateState((current) => ({ ...current, sort: edit(current.sort) }));
    }),
    setHideDone: (hideDone) => {
      updateState((current) => ({ ...current, hideDone }));
    },
    start: () => {
      const subscription = settings.subscribe(deps.save);

      return () => {
        subscription.unsubscribe();
      };
    },
  };
};
