import { Arr, hasKey, isRecord } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { type WorkspaceState } from '../layout/index.mjs';
import {
  addWorkspaceEntry,
  nextWorkspaceName,
  parseWorkspaceRegistry,
  renameWorkspaceEntry,
  saveWorkspaceRegistry,
  workspaceEntryOf,
  type WorkspaceRegistry,
} from './registry.mjs';
import {
  loadWorkspaceState,
  parseWorkspaceState,
  saveWorkspaceState,
} from './storage.mjs';

/** One saved split view, name and layout together, outside the browser. */
export type BackedUpWorkspace = Readonly<{
  id: string;
  name: string;
  state: WorkspaceState;
}>;

export type ImportResult = Readonly<{
  registry: WorkspaceRegistry;
  added: number;
  replaced: number;
}>;

/**
 * Writes the whole list out as JSON.
 *
 * The point of it is an extension id that changed. `chrome.storage.local`
 * belongs to the extension id, and an *unpacked* extension's id is derived from
 * the directory it was loaded from — so the same code loaded from a different
 * path, or packed into a `.crx`, is a different extension with empty storage.
 * `key` in the manifest pins the id and is the fix; this is the way across for
 * everything saved before it was pinned, and the backup for everything after.
 */
export const exportWorkspacesAsJson = async (
  registry: WorkspaceRegistry,
): Promise<string> => {
  const workspaces = await Promise.all(
    registry.entries.map(async (entry) => ({
      id: entry.id,
      name: entry.name,
      state: (await loadWorkspaceState(entry.id)) ?? emptyStoredState,
    })),
  );

  return `${JSON.stringify(
    {
      kind: backupKind,
      version: 1,
      exportedAt: exportClock.format(Date.now()),
      workspaces,
    },
    undefined,
    2,
  )}\n`;
};

/**
 * Reads a backup back in, by id: an id already on the list has its layout and
 * name replaced, an id that is not is appended. Nothing is deleted.
 *
 * Keying on the id rather than appending everything is what makes importing the
 * same file twice do nothing the second time — the ids in a backup are the ids
 * the workspaces had, so a backup restored onto a fresh profile comes back with
 * its `?ws=` URLs still valid.
 */
export const importWorkspacesFromJson = async (
  registry: WorkspaceRegistry,
  text: string,
  now: number,
): Promise<ImportResult | undefined> => {
  const workspaces = parseBackup(text);

  if (workspaces === undefined) {
    return undefined;
  }

  const next = workspaces.reduce(
    (acc, workspace) =>
      workspaceEntryOf(acc, workspace.id) === undefined
        ? addWorkspaceEntry(acc, {
            id: workspace.id,
            name: uniqueName(acc, workspace.name),
            createdAt: now,
          })
        : renameWorkspaceEntry(acc, workspace.id, workspace.name),
    registry,
  );

  await Promise.all(
    workspaces.map(async (workspace) =>
      saveWorkspaceState(workspace.id, workspace.state),
    ),
  );

  await saveWorkspaceRegistry(next);

  return {
    registry: next,
    added: workspaces.filter(
      (workspace) => workspaceEntryOf(registry, workspace.id) === undefined,
    ).length,
    replaced: workspaces.filter(
      (workspace) => workspaceEntryOf(registry, workspace.id) !== undefined,
    ).length,
  };
};

/**
 * Reads either shape of backup: the envelope `exportWorkspacesAsJson` writes,
 * or a raw `chrome.storage.local.get(null)` dump.
 *
 * The dump is accepted because it is the only way out of an extension id that
 * has already changed — the old id's page can no longer export, but its DevTools
 * console can still print its storage, and pasting that in has to work.
 */
export const parseBackup = (
  text: string,
): readonly BackedUpWorkspace[] | undefined => {
  const parsed: unknown = safeJsonParse(text);

  if (!isRecord(parsed)) {
    return undefined;
  }

  const fromEnvelope = hasKey(parsed, 'workspaces')
    ? parseEnvelope(parsed.workspaces)
    : undefined;

  return fromEnvelope ?? parseStorageDump(parsed);
};

const backupKind = 'split-view-backup';

/**
 * When the file was written, for whoever reads it later. Formatted rather than
 * built from a `Date`, which is the same reason the service worker's log uses
 * one of these: `new Date` is not what this repository writes.
 */
const exportClock = new Intl.DateTimeFormat('sv-SE', {
  dateStyle: 'short',
  timeStyle: 'medium',
});

const workspaceKeyPrefix = 'workspace:';

/**
 * What an entry with no stored layout exports as. A workspace can be on the
 * list before it has ever been saved — it is created and then switched to — and
 * a backup that skipped it would lose the name.
 */
const emptyStoredState: WorkspaceState = {
  version: 1,
  root: { kind: 'pane', paneId: 0 },
  panes: [],
  nextPaneId: 1,
  activePaneId: undefined,
} as const;

const parseEnvelope = (
  value: unknown,
): readonly BackedUpWorkspace[] | undefined => {
  if (!Arr.isArray(value)) {
    return undefined;
  }

  const workspaces = value
    .map(parseBackedUpWorkspace)
    .filter((entry) => entry !== undefined);

  return Arr.isNonEmpty(workspaces) ? workspaces : undefined;
};

/**
 * Reads the `workspace:<id>` records out of a storage dump, taking the names
 * from the dumped registry where there is one.
 */
const parseStorageDump = (
  dump: ReadonlyRecord<string, unknown>,
): readonly BackedUpWorkspace[] | undefined => {
  const names = new Map(
    (parseWorkspaceRegistry(dump['workspaceRegistry'])?.entries ?? []).map(
      (entry) => [entry.id, entry.name] as const,
    ),
  );

  const workspaces = Object.entries(dump)
    .filter(([key]) => key.startsWith(workspaceKeyPrefix))
    .map(([key, value]) => {
      const id = key.slice(workspaceKeyPrefix.length);

      const state = parseWorkspaceState(
        isRecord(value) && hasKey(value, 'state') ? value.state : value,
      );

      return state === undefined
        ? undefined
        : { id, name: names.get(id) ?? id, state };
    })
    .filter((entry) => entry !== undefined);

  return Arr.isNonEmpty(workspaces) ? workspaces : undefined;
};

const parseBackedUpWorkspace = (
  value: unknown,
): BackedUpWorkspace | undefined => {
  if (!isRecord(value) || !hasKey(value, 'id')) {
    return undefined;
  }

  if (typeof value.id !== 'string' || value.id === '') {
    return undefined;
  }

  const state = hasKey(value, 'state')
    ? parseWorkspaceState(value.state)
    : undefined;

  return {
    id: value.id,
    name:
      hasKey(value, 'name') &&
      typeof value.name === 'string' &&
      value.name.trim() !== ''
        ? value.name.trim()
        : value.id,
    state: state ?? emptyStoredState,
  };
};

/** Keeps an imported name from colliding with one already on the list. */
const uniqueName = (registry: WorkspaceRegistry, candidate: string): string =>
  registry.entries.some((entry) => entry.name === candidate)
    ? nextWorkspaceName(registry)
    : candidate;

/**
 * Hands the text to the browser as a file.
 *
 * An anchor with `download`, because an extension page may not use
 * `chrome.downloads` without the permission for it, and this needs none.
 */
export const downloadJsonFile = (fileName: string, text: string): void => {
  const url = URL.createObjectURL(
    new Blob([text], { type: 'application/json' }),
  );

  const mut_anchor = document.createElement('a');

  mut_anchor.href = url;

  mut_anchor.download = fileName;

  mut_anchor.click();

  // The click is synchronous, so the object URL has done its work by here; a
  // page that never revokes one keeps the blob for the life of the document.
  URL.revokeObjectURL(url);
};

const safeJsonParse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};
