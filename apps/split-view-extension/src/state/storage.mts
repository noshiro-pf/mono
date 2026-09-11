import { Arr, hasKey, isRecord } from 'ts-data-forge';
import {
  clampPaneZoom,
  clampRatio,
  defaultPaneZoom,
  type LayoutNode,
  type PaneState,
  type WorkspaceState,
} from '../layout/index.mjs';

const storageKeyPrefix = 'workspace:';

/** What the registry needs to know about a workspace record in storage. */
export type StoredWorkspaceSummary = Readonly<{ id: string; savedAt: number }>;

/**
 * Reads a workspace back.
 *
 * Everything is validated field by field: what comes out of storage was written
 * by an older version of this code, and a stored layout that no longer parses
 * has to degrade to "start fresh" rather than to a page that throws on load.
 */
export const loadWorkspaceState = async (
  workspaceId: string,
): Promise<WorkspaceState | undefined> => {
  const key = storageKeyOf(workspaceId);

  const stored = await chrome.storage.local.get(key);

  const raw: unknown = stored[key];

  if (!isRecord(raw) || !hasKey(raw, 'state')) {
    return undefined;
  }

  return parseWorkspaceState(raw.state);
};

export const saveWorkspaceState = async (
  workspaceId: string,
  state: WorkspaceState,
): Promise<void> => {
  await chrome.storage.local.set({
    [storageKeyOf(workspaceId)]: {
      savedAt: Date.now(),
      state: collapseForStorage(state),
    },
  });
};

/**
 * Folds `currentUrl` into `url` before saving, so that a reload restores where
 * the user navigated to inside the pane rather than the address the pane was
 * originally pointed at.
 */
const collapseForStorage = (state: WorkspaceState): WorkspaceState =>
  ({
    ...state,
    panes: state.panes.map((pane) => ({
      ...pane,
      url: pane.currentUrl ?? pane.url,
      currentUrl: undefined,
      title: undefined,
    })),
  }) as const;

/**
 * Every workspace record in storage, which is what the list is recovered from
 * when there is no list yet.
 */
export const listStoredWorkspaces = async (): Promise<
  readonly StoredWorkspaceSummary[]
> => {
  const all = await chrome.storage.local.get(null);

  return Object.entries<unknown>(all)
    .filter(([key]) => key.startsWith(storageKeyPrefix))
    .map(([key, value]) => ({
      id: key.slice(storageKeyPrefix.length),
      savedAt: savedAtOf(value),
    }));
};

export const removeWorkspaceState = async (
  workspaceId: string,
): Promise<void> => {
  await chrome.storage.local.remove(storageKeyOf(workspaceId));
};

/**
 * Deletes the workspace records the list does not name.
 *
 * This used to be a cap — the twenty most recently saved workspaces were kept
 * and the rest dropped — which was reasonable while nothing referred to a
 * workspace by name, and is not any more: a layout on the list has to stay
 * until the user deletes it, however long ago it was last opened. What is left
 * to sweep is the records nothing refers to, which is what a workspace deleted
 * from the list leaves behind if the removal is interrupted.
 */
export const pruneUnlistedWorkspaces = async (
  knownIds: readonly string[],
): Promise<void> => {
  const stored = await listStoredWorkspaces();

  const doomed = stored
    .filter((entry) => !knownIds.includes(entry.id))
    .map((entry) => storageKeyOf(entry.id));

  if (!Arr.isNonEmpty(doomed)) {
    return;
  }

  await chrome.storage.local.remove(doomed);
};

export const parseWorkspaceState = (
  value: unknown,
): WorkspaceState | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const root = hasKey(value, 'root') ? parseLayoutNode(value.root) : undefined;

  if (root === undefined) {
    return undefined;
  }

  const panes =
    hasKey(value, 'panes') && Arr.isArray(value.panes)
      ? value.panes.map(parsePaneState).filter(isDefined)
      : ([] as const);

  return {
    version: 1,
    root,
    panes,
    nextPaneId:
      hasKey(value, 'nextPaneId') && typeof value.nextPaneId === 'number'
        ? value.nextPaneId
        : 0,
    activePaneId:
      hasKey(value, 'activePaneId') && typeof value.activePaneId === 'number'
        ? value.activePaneId
        : undefined,
  };
};

const parseLayoutNode = (value: unknown): LayoutNode | undefined => {
  if (!isRecord(value) || !hasKey(value, 'kind')) {
    return undefined;
  }

  if (value.kind === 'pane') {
    return hasKey(value, 'paneId') && typeof value.paneId === 'number'
      ? { kind: 'pane', paneId: value.paneId }
      : undefined;
  }

  if (value.kind !== 'split') {
    return undefined;
  }

  if (!(
    hasKey(value, 'axis') &&
    (value.axis === 'row' || value.axis === 'column')
  )) {
    return undefined;
  }

  const first = hasKey(value, 'first')
    ? parseLayoutNode(value.first)
    : undefined;

  const second = hasKey(value, 'second')
    ? parseLayoutNode(value.second)
    : undefined;

  if (first === undefined || second === undefined) {
    return undefined;
  }

  return {
    kind: 'split',
    axis: value.axis,
    ratio: clampRatio(
      hasKey(value, 'ratio') && typeof value.ratio === 'number'
        ? value.ratio
        : 0.5,
    ),
    first,
    second,
  };
};

const parsePaneState = (value: unknown): PaneState | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  if (!(hasKey(value, 'id') && typeof value.id === 'number')) {
    return undefined;
  }

  // Only the address is worth restoring. A title belongs to the document the
  // pane will load, and the frame reports one as soon as it has loaded it.
  return {
    id: value.id,
    url: hasKey(value, 'url') && typeof value.url === 'string' ? value.url : '',
    currentUrl: undefined,
    title: undefined,
    sandboxed:
      hasKey(value, 'sandboxed') && typeof value.sandboxed === 'boolean'
        ? value.sandboxed
        : true,
    historyLength: 1,
    zoom:
      hasKey(value, 'zoom') && typeof value.zoom === 'number'
        ? clampPaneZoom(value.zoom)
        : defaultPaneZoom,
    reloadToken: 0,
  };
};

const savedAtOf = (value: unknown): number =>
  isRecord(value) &&
  hasKey(value, 'savedAt') &&
  typeof value.savedAt === 'number'
    ? value.savedAt
    : 0;

const storageKeyOf = (workspaceId: string): string =>
  `${storageKeyPrefix}${workspaceId}` as const;

const isDefined = <T,>(value: T | undefined): value is T => value !== undefined;
