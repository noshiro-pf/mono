import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import {
  encodeWorkspaceRecord,
  listFromRecords,
  parseList,
  parseOrigins,
  parseWorkspaceRecord,
  savedAtOfRecord,
  storageKeys,
  workspaceIdOfKey,
  workspaceKeyOf,
  type SplitViewList,
  type StoredWorkspace,
} from '../core/index.mjs';

/**
 * `chrome.storage.local`, through the codecs (contract C2). Every read repairs
 * rather than refuses (spec S2, S3).
 */

/**
 * The stored list, or one rebuilt from the records when there is none. Every
 * record is read only then: the list alone is what a page load and a toolbar
 * click need.
 */
export const readList = async (): Promise<SplitViewList> => {
  const { list } = await readStoredList();

  return list;
};

/**
 * The list, and whether it is stored as read: `false` when it was rebuilt from
 * the records, which the worker then writes so that it stops being rebuilt — in
 * an order that each save of a record would change.
 */
export const readStoredList = async (): Promise<
  Readonly<{ list: SplitViewList; stored: boolean }>
> => {
  const listed = await chrome.storage.local.get(storageKeys.list);

  const parsed = parseList(listed[storageKeys.list]);

  return parsed === undefined
    ? { list: await listFromStoredRecords(), stored: false }
    : { list: parsed, stored: true };
};

export const writeList = async (list: SplitViewList): Promise<void> => {
  await chrome.storage.local.set({ [storageKeys.list]: list });
};

export const readWorkspace = async (
  id: string,
): Promise<StoredWorkspace | undefined> => {
  const key = workspaceKeyOf(id);

  const stored = await chrome.storage.local.get(key);

  return parseWorkspaceRecord(stored[key]);
};

export const writeWorkspace = async (
  id: string,
  workspace: StoredWorkspace,
): Promise<void> => {
  await chrome.storage.local.set({
    [workspaceKeyOf(id)]: encodeWorkspaceRecord(workspace, Date.now()),
  });
};

export const removeWorkspace = async (id: string): Promise<void> => {
  await chrome.storage.local.remove(workspaceKeyOf(id));
};

/** Deletes the records the list does not name (spec S3). */
export const pruneWorkspaces = async (list: SplitViewList): Promise<void> => {
  const named = new Set<string>(list.entries.map(({ id }) => id));

  const keys = Object.keys(await chrome.storage.local.get(null)).filter(
    (key) => {
      const id = workspaceIdOfKey(key);

      // A bare `workspace:` is a record of nothing, and goes too.
      return (
        key.startsWith(storageKeys.workspacePrefix) &&
        (id === undefined || !named.has(id))
      );
    },
  );

  if (Arr.isNonEmpty(keys)) {
    await chrome.storage.local.remove(keys);
  }
};

export const readResetOrigins = async (): Promise<readonly string[]> => {
  const stored = await chrome.storage.local.get(storageKeys.resetOrigins);

  return parseOrigins(stored[storageKeys.resetOrigins]);
};

export const writeResetOrigins = async (
  origins: readonly string[],
): Promise<void> => {
  await chrome.storage.local.set({ [storageKeys.resetOrigins]: origins });
};

/**
 * Calls back with the list or the origins another tab wrote (spec W9), until
 * the returned function is called.
 */
export const watchStorage = (
  handlers: Readonly<{
    /** `undefined` where the list is not wanted, which is then not parsed. */
    list: ((list: SplitViewList) => void) | undefined;
    resetOrigins: (origins: readonly string[]) => void;
  }>,
): (() => void) => {
  const listener = (
    changes: DeepReadonly<Record<string, chrome.storage.StorageChange>>,
    area: string,
  ): void => {
    if (area !== 'local') {
      return;
    }

    const listChange = changes[storageKeys.list];

    const list =
      listChange === undefined || handlers.list === undefined
        ? undefined
        : parseList(listChange.newValue);

    if (list !== undefined) {
      handlers.list?.(list);
    }

    const originsChange = changes[storageKeys.resetOrigins];

    if (originsChange !== undefined) {
      handlers.resetOrigins(parseOrigins(originsChange.newValue));
    }
  };

  chrome.storage.onChanged.addListener(listener);

  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
};

const listFromStoredRecords = async (): Promise<SplitViewList> => {
  const stored = await chrome.storage.local.get(null);

  return listFromRecords(
    Object.entries(stored)
      .map(([key, value]) => {
        const id = workspaceIdOfKey(key);

        return id === undefined
          ? undefined
          : { id, savedAt: savedAtOfRecord(value) };
      })
      .filter((record) => record !== undefined),
  );
};
