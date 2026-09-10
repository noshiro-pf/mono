import { Arr, hasKey, isRecord, Num, Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { defaultWorkspaceId } from '../shared/index.mjs';
import {
  listStoredWorkspaces,
  type StoredWorkspaceSummary,
} from './storage.mjs';

/** One saved split view, as the list knows it. */
export type WorkspaceEntry = Readonly<{
  id: string;

  /**
   * What the list, the tab title and the favicon show. It defaults to
   * `split-view-<n>` and is the user's to change; the *number* the favicon and
   * `Alt+N` use is the entry's position in the list, not the one in the name,
   * so a renamed or reordered workspace stays findable.
   */
  name: string;

  createdAt: number;
}>;

/**
 * The list of saved split views.
 *
 * The layouts themselves have always been in `chrome.storage.local`, one record
 * per workspace, and have always survived the tab being closed. What was
 * missing was this: a record of *which* workspaces exist, in what order, under
 * what name. Without it a workspace whose tab was closed could not be found
 * again — the toolbar button opened a fixed id and the button that made a new
 * one handed out random ids — so closing the tab was, in effect, losing the
 * layout.
 */
export type WorkspaceRegistry = Readonly<{
  version: 1;
  entries: readonly WorkspaceEntry[];

  /**
   * The workspace the toolbar button and a `split.html` with no `?ws=` open.
   * "Where I was last", which is the only answer that does not need the user to
   * remember an id.
   */
  activeId: string | undefined;
}>;

export const emptyWorkspaceRegistry: WorkspaceRegistry = {
  version: 1,
  entries: [],
  activeId: undefined,
} as const;

export const addWorkspaceEntry = (
  registry: WorkspaceRegistry,
  entry: WorkspaceEntry,
): WorkspaceRegistry =>
  registry.entries.some((existing) => existing.id === entry.id)
    ? registry
    : ({
        ...registry,
        entries: Arr.toPushed(registry.entries, entry),
      } as const);

/**
 * Drops an entry. The caller is left to decide what to show instead — see
 * `activeId` in the result, which moves to whatever takes the deleted entry's
 * place, as closing a browser tab does, and is `undefined` only when the list
 * is now empty.
 */
export const removeWorkspaceEntry = (
  registry: WorkspaceRegistry,
  id: string,
): WorkspaceRegistry => {
  const entries = registry.entries.filter((entry) => entry.id !== id);

  if (entries.length === registry.entries.length) {
    return registry;
  }

  const index = registry.entries.findIndex((entry) => entry.id === id);

  return {
    ...registry,
    entries,
    activeId:
      registry.activeId === id
        ? entries[Math.min(index, entries.length - 1)]?.id
        : registry.activeId,
  };
};

/** Renames an entry. A name that is blank once trimmed is refused. */
export const renameWorkspaceEntry = (
  registry: WorkspaceRegistry,
  id: string,
  workspaceName: string,
): WorkspaceRegistry => {
  const trimmed = workspaceName.trim();

  return trimmed === ''
    ? registry
    : {
        ...registry,
        entries: registry.entries.map((entry) =>
          entry.id === id ? { ...entry, name: trimmed } : entry,
        ),
      };
};

/**
 * Moves an entry `offset` places along the list, clamped at both ends.
 *
 * Reordering is not decoration: the position is what the favicon shows and what
 * `Alt+N` selects, so this is how a workspace is given a shorter shortcut.
 */
export const moveWorkspaceEntry = (
  registry: WorkspaceRegistry,
  id: string,
  offset: number,
): WorkspaceRegistry => {
  const index = registry.entries.findIndex((entry) => entry.id === id);

  const moving = registry.entries[index];

  if (moving === undefined) {
    return registry;
  }

  const target = Math.min(
    registry.entries.length - 1,
    Math.max(0, index + offset),
  );

  if (target === index) {
    return registry;
  }

  const without = registry.entries.filter((entry) => entry.id !== id);

  return {
    ...registry,
    entries: [...without.slice(0, target), moving, ...without.slice(target)],
  };
};

export const activateWorkspaceEntry = (
  registry: WorkspaceRegistry,
  id: string,
): WorkspaceRegistry =>
  registry.activeId === id
    ? registry
    : ({ ...registry, activeId: id } as const);

/** The 1-based position of an entry, which is the number shown for it. */
export const workspacePositionOf = (
  registry: WorkspaceRegistry,
  id: string,
): number | undefined => {
  const index = registry.entries.findIndex((entry) => entry.id === id);

  return index === -1 ? undefined : index + 1;
};

export const workspaceAtPosition = (
  registry: WorkspaceRegistry,
  position: number,
): WorkspaceEntry | undefined => registry.entries[position - 1];

export const workspaceEntryOf = (
  registry: WorkspaceRegistry,
  id: string,
): WorkspaceEntry | undefined =>
  registry.entries.find((entry) => entry.id === id);

/**
 * The name a new workspace gets: `split-view-<n>` for the smallest `n` no
 * entry is already named after.
 *
 * The smallest unused number rather than "one more than the count", so that
 * creating a workspace after deleting one reuses the short name instead of
 * counting ever upwards.
 */
export const nextWorkspaceName = (registry: WorkspaceRegistry): string => {
  const used = new Set(
    registry.entries.flatMap((entry) => {
      const matched = defaultNamePattern.exec(entry.name);

      const digits = matched?.[1];

      return digits === undefined
        ? []
        : [Result.unwrapOkOr(Num.safeParseInt(digits), Number.NaN)];
    }),
  );

  const firstUnused = (candidate: number): number =>
    used.has(candidate) ? firstUnused(candidate + 1) : candidate;

  return `split-view-${String(firstUnused(1))}`;
};

/**
 * Builds a list out of the workspace records that are already in storage.
 *
 * This is the migration, and it runs once: every workspace saved before the
 * list existed is still there under `workspace:<id>`, so the list can be
 * recovered from storage rather than started empty — which would have left the
 * layouts present, unreferenced and unreachable.
 */
export const registryFromStoredWorkspaces = (
  stored: readonly StoredWorkspaceSummary[],
): WorkspaceRegistry => {
  const ordered = [
    ...stored.filter((entry) => entry.id === defaultWorkspaceId),
    ...Arr.toSorted(
      stored.filter((entry) => entry.id !== defaultWorkspaceId),
      (a, b) => b.savedAt - a.savedAt,
    ),
  ] as const;

  return {
    version: 1,
    entries: ordered.map((entry, index) => ({
      id: entry.id,
      name: `split-view-${String(index + 1)}`,
      createdAt: entry.savedAt,
    })),
    activeId: ordered[0]?.id,
  };
};

/**
 * Reads the list back, and builds one from the stored workspaces when there is
 * none to read.
 */
export const loadWorkspaceRegistry = async (): Promise<WorkspaceRegistry> => {
  const stored = await chrome.storage.local.get(registryStorageKey);

  const parsed = parseWorkspaceRegistry(stored[registryStorageKey]);

  if (parsed !== undefined && Arr.isNonEmpty(parsed.entries)) {
    return parsed;
  }

  return registryFromStoredWorkspaces(await listStoredWorkspaces());
};

export const saveWorkspaceRegistry = async (
  registry: WorkspaceRegistry,
): Promise<void> => {
  await chrome.storage.local.set({ [registryStorageKey]: registry });
};

/**
 * Everything the freshly loaded page needs to know: which list there is, and
 * which workspace this tab is showing.
 *
 * `fromUrl` wins when it names a workspace, registered or not — a `?ws=` that
 * is not in the list is *added* to it rather than refused, because such a URL
 * is a bookmark, a restored session, or the smoke test, and losing the layout
 * it names would be the one unrecoverable outcome. The list is written back
 * only when this changed it.
 */
export const resolveWorkspace = async (
  fromUrl: string | undefined,
  now: number,
): Promise<Readonly<{ registry: WorkspaceRegistry; workspaceId: string }>> => {
  const loaded = await loadWorkspaceRegistry();

  const withUrlEntry =
    fromUrl === undefined || workspaceEntryOf(loaded, fromUrl) !== undefined
      ? loaded
      : addWorkspaceEntry(loaded, {
          id: fromUrl,
          name: nextWorkspaceName(loaded),
          createdAt: now,
        });

  const withFirstEntry = Arr.isNonEmpty(withUrlEntry.entries)
    ? withUrlEntry
    : addWorkspaceEntry(withUrlEntry, {
        id: defaultWorkspaceId,
        name: nextWorkspaceName(withUrlEntry),
        createdAt: now,
      });

  const workspaceId =
    fromUrl ??
    (withFirstEntry.activeId !== undefined &&
    workspaceEntryOf(withFirstEntry, withFirstEntry.activeId) !== undefined
      ? withFirstEntry.activeId
      : (withFirstEntry.entries[0]?.id ?? defaultWorkspaceId));

  const registry = activateWorkspaceEntry(withFirstEntry, workspaceId);

  if (registry !== loaded) {
    await saveWorkspaceRegistry(registry);
  }

  return { registry, workspaceId };
};

/**
 * Calls back whenever the list is written — by this tab or by another one.
 *
 * Every tab holds its own copy, and `saveWorkspaceRegistry` writes the whole
 * record: without this, adding a workspace in one tab and then switching in
 * another would write the second tab's older list back over it, and the new
 * workspace would vanish from the strip while its layout sat in storage
 * unreferenced. The caller is expected to adopt what arrives and *not* write it
 * back, which is what keeps two tabs from answering each other for ever.
 */
export const watchWorkspaceRegistry = (
  onWritten: (registry: WorkspaceRegistry) => void,
): (() => void) => {
  const listener = (
    // `chrome.storage.StorageChange` itself cannot be a parameter type here —
    // its fields are mutable, which the lint rules refuse. The two fields that
    // are read say as much.
    changes: ReadonlyRecord<string, Readonly<{ newValue?: unknown }>>,
    areaName: string,
  ): void => {
    if (areaName !== 'local') {
      return;
    }

    const change = changes[registryStorageKey];

    if (change === undefined) {
      return;
    }

    const parsed = parseWorkspaceRegistry(change.newValue);

    if (parsed !== undefined) {
      onWritten(parsed);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
};

export const parseWorkspaceRegistry = (
  value: unknown,
): WorkspaceRegistry | undefined => {
  if (!isRecord(value) || !hasKey(value, 'entries')) {
    return undefined;
  }

  const entries = Arr.isArray(value.entries)
    ? dedupeById(
        value.entries
          .map(parseWorkspaceEntry)
          .filter((entry) => entry !== undefined),
      )
    : ([] as const);

  const activeId =
    hasKey(value, 'activeId') && typeof value.activeId === 'string'
      ? value.activeId
      : undefined;

  return {
    version: 1,
    entries,
    activeId:
      activeId !== undefined && entries.some((entry) => entry.id === activeId)
        ? activeId
        : entries[0]?.id,
  };
};

const registryStorageKey = 'workspaceRegistry';

const defaultNamePattern = /^split-view-(\d+)$/u;

const parseWorkspaceEntry = (value: unknown): WorkspaceEntry | undefined => {
  if (!isRecord(value) || !hasKey(value, 'id')) {
    return undefined;
  }

  if (typeof value.id !== 'string' || value.id === '') {
    return undefined;
  }

  return {
    id: value.id,
    name:
      hasKey(value, 'name') &&
      typeof value.name === 'string' &&
      value.name.trim() !== ''
        ? value.name
        : value.id,
    createdAt:
      hasKey(value, 'createdAt') && typeof value.createdAt === 'number'
        ? value.createdAt
        : 0,
  };
};

const dedupeById = (
  entries: readonly WorkspaceEntry[],
): readonly WorkspaceEntry[] =>
  entries.filter(
    (entry, index) =>
      entries.findIndex((candidate) => candidate.id === entry.id) === index,
  );
