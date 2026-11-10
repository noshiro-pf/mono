import { Arr, hasKey, isRecord, isString, Json, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { paneAddressOf } from './address.mjs';
import { asPaneId, nonEmpty, numberField, stringField } from './fields.mjs';
import {
  clampFixedPx,
  clampRatio,
  clampZoom,
  defaultZoom,
  maxPaneCount,
  type FixedSize,
  type LayoutNode,
  type PaneId,
} from './layout/index.mjs';
import type { ListEntry, SplitViewList } from './list.mjs';
import type { StoredPane, StoredWorkspace } from './workspace/index.mjs';

/**
 * Everything read from storage was written by some earlier version, so it is
 * repaired rather than trusted (spec S2, S3): what does not parse degrades to a
 * default, and only a value with no usable shape at all is `undefined`.
 */

/** The storage keys (contract C2). */
export const storageKeys = {
  list: 'workspaceRegistry',
  workspacePrefix: 'workspace:',
  resetOrigins: 'serviceWorkerResetOrigins',
} as const;

export const workspaceKeyOf = (id: string): string =>
  `${storageKeys.workspacePrefix}${id}` as const;

/**
 * The id a `workspace:<id>` key is for, or `undefined` for any other key and
 * for a bare `workspace:`, which names no split view.
 */
export const workspaceIdOfKey = (key: string): string | undefined =>
  key.startsWith(storageKeys.workspacePrefix)
    ? nonEmpty(key.slice(storageKeys.workspacePrefix.length))
    : undefined;

/** A `workspace:<id>` value, `{ savedAt, state }`. */
export const encodeWorkspaceRecord = (
  workspace: StoredWorkspace,
  savedAt: number,
): Readonly<{ savedAt: number; state: StoredWorkspace }> =>
  ({
    savedAt,
    state: workspace,
  }) as const;

/** The state inside a `workspace:<id>` value, or `undefined`. */
export const parseWorkspaceRecord = (
  value: unknown,
): StoredWorkspace | undefined =>
  isRecord(value) && hasKey(value, 'state')
    ? parseStoredWorkspace(value.state)
    : undefined;

export const savedAtOfRecord = (value: unknown): number =>
  isRecord(value) &&
  hasKey(value, 'savedAt') &&
  typeof value.savedAt === 'number'
    ? value.savedAt
    : 0;

export const parseStoredWorkspace = (
  value: unknown,
): StoredWorkspace | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const root = hasKey(value, 'root')
    ? parseLayout(value.root, 0, 0)?.node
    : undefined;

  if (root === undefined) {
    return undefined;
  }

  const title = hasKey(value, 'title') ? nonBlank(value.title) : undefined;

  return {
    version: 1,
    root,
    panes:
      hasKey(value, 'panes') && Arr.isArray(value.panes)
        ? value.panes.map(parseStoredPane).filter((pane) => pane !== undefined)
        : [],
    nextPaneId: paneIdField(value, 'nextPaneId') ?? 0,
    activePaneId: paneIdField(value, 'activePaneId'),
    ...(title === undefined ? {} : { title }),
  };
};

export const parseList = (value: unknown): SplitViewList | undefined => {
  // A list whose entries cannot be read is no list, so that it is rebuilt from
  // the records rather than taken as empty and their layouts pruned.
  if (
    !isRecord(value) ||
    !hasKey(value, 'entries') ||
    !Arr.isArray(value.entries)
  ) {
    return undefined;
  }

  const parsed = value.entries
    .map(parseEntry)
    .filter((entry) => entry !== undefined);

  // No entry to read is no list either: one this extension wrote always has one
  // (removing the last adds a fresh one).
  if (!Arr.isNonEmpty(parsed)) {
    return undefined;
  }

  // The first of a duplicated id wins.
  const entries = parsed.filter(
    (entry, index) => parsed.findIndex(({ id }) => id === entry.id) === index,
  );

  const activeId = stringField(value, 'activeId');

  return {
    version: 1,
    entries,
    activeId:
      activeId !== undefined && entries.some((entry) => entry.id === activeId)
        ? activeId
        : entries[0]?.id,
  };
};

export const parseOrigins = (value: unknown): readonly string[] =>
  Arr.isArray(value) ? value.filter(isString) : ([] as const);

/** One split view in a backup file (spec W6). */
export type BackedUpWorkspace = Readonly<{
  id: string;
  name: string;
  state: StoredWorkspace;
}>;

export const backupKind = 'split-view-backup';

export const formatBackup = (
  workspaces: readonly BackedUpWorkspace[],
  exportedAt: string,
): string =>
  `${JSON.stringify(
    { kind: backupKind, version: 1, exportedAt, workspaces },
    undefined,
    2,
  )}\n` as const;

/**
 * The split views in a backup: the envelope `formatBackup` writes, or a raw
 * `chrome.storage.local.get(null)` dump — the way across an extension id that
 * has already changed, whose page can no longer export. `undefined` when the
 * text holds none.
 */
export const parseBackup = (
  text: string,
): readonly BackedUpWorkspace[] | undefined => {
  const parsed = Result.unwrapOkOr(Json.parse(text), undefined);

  if (!isRecord(parsed)) {
    return undefined;
  }

  const workspaces =
    hasKey(parsed, 'workspaces') && Arr.isArray(parsed.workspaces)
      ? parsed.workspaces
          .map(parseBackedUp)
          .filter((entry) => entry !== undefined)
      : parseStorageDump(parsed);

  return Arr.isNonEmpty(workspaces) ? workspaces : undefined;
};

/** What a split view on the list with no stored layout is backed up as. */
export const emptyStoredWorkspace: StoredWorkspace = {
  version: 1,
  root: { kind: 'pane', paneId: 0 },
  panes: [],
  nextPaneId: 1,
  activePaneId: undefined,
} as const;

const nonBlank = (value: unknown): string | undefined =>
  isString(value) && value.trim() !== '' ? value.trim() : undefined;

const parseBackedUp = (value: unknown): BackedUpWorkspace | undefined => {
  if (!isRecord(value) || !hasKey(value, 'id')) {
    return undefined;
  }

  const id = nonBlank(value.id);

  if (id === undefined) {
    return undefined;
  }

  return {
    id,
    name: (hasKey(value, 'name') ? nonBlank(value.name) : undefined) ?? id,
    state:
      (hasKey(value, 'state')
        ? parseStoredWorkspace(value.state)
        : undefined) ?? emptyStoredWorkspace,
  };
};

const parseStorageDump = (
  dump: ReadonlyRecord<string, unknown>,
): readonly BackedUpWorkspace[] => {
  const names = new Map(
    (parseList(dump[storageKeys.list])?.entries ?? []).map(
      (entry) => [entry.id, entry.name] as const,
    ),
  );

  return Object.entries(dump)
    .map(([key, value]) => {
      const id = workspaceIdOfKey(key);

      const state = parseWorkspaceRecord(value) ?? parseStoredWorkspace(value);

      return id === undefined || state === undefined
        ? undefined
        : { id, name: names.get(id) ?? id, state };
    })
    .filter((entry) => entry !== undefined);
};

const paneIdField = (
  record: ReadonlyRecord<string, unknown>,
  key: string,
): PaneId | undefined => asPaneId(record[key]);

const parseEntry = (value: unknown): ListEntry | undefined => {
  if (!isRecord(value) || !hasKey(value, 'id')) {
    return undefined;
  }

  const { id } = value;

  if (id === '' || !isString(id)) {
    return undefined;
  }

  return {
    id,
    name: (hasKey(value, 'name') ? nonBlank(value.name) : undefined) ?? id,
    createdAt: numberField(value, 'createdAt') ?? 0,
    pinned: hasKey(value, 'pinned') && value.pinned === true,
  };
};

const parseStoredPane = (value: unknown): StoredPane | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = paneIdField(value, 'id');

  if (id === undefined) {
    return undefined;
  }

  return {
    id,
    // A backup may come from anywhere: a scheme no pane navigates to is dropped
    // as a typed one would be searched for (spec S2).
    url: paneAddressOf(stringField(value, 'url') ?? '') ?? '',
    // On unless it says off: the safe default.
    sandboxed: !(hasKey(value, 'sandboxed') && value.sandboxed === false),
    zoom: clampZoom(numberField(value, 'zoom') ?? defaultZoom),
  };
};

const parseFixed = (value: unknown): FixedSize | undefined => {
  if (
    !isRecord(value) ||
    !hasKey(value, 'child') ||
    (value.child !== 'first' && value.child !== 'second')
  ) {
    return undefined;
  }

  const px = numberField(value, 'px');

  return px === undefined
    ? undefined
    : { child: value.child, px: clampFixedPx(px) };
};

/**
 * A tree with more panes than a split view may have (`maxPaneCount`) is refused
 * as soon as that shows, before the recursion runs away with it: `leavesBefore`
 * is how many leaves were read before this node, and `depth` how far down it
 * is, which for so many leaves stays under `maxPaneCount`.
 */
const parseLayout = (
  value: unknown,
  depth: number,
  leavesBefore: number,
): Readonly<{ node: LayoutNode; leaves: number }> | undefined => {
  if (depth >= maxPaneCount || !isRecord(value) || !hasKey(value, 'kind')) {
    return undefined;
  }

  if (value.kind === 'pane') {
    const paneId = paneIdField(value, 'paneId');

    const leaves = leavesBefore + 1;

    return paneId === undefined || leaves > maxPaneCount
      ? undefined
      : { node: { kind: 'pane', paneId }, leaves };
  }

  if (
    value.kind !== 'split' ||
    !hasKey(value, 'axis') ||
    (value.axis !== 'row' && value.axis !== 'column')
  ) {
    return undefined;
  }

  const first = hasKey(value, 'first')
    ? parseLayout(value.first, depth + 1, leavesBefore)
    : undefined;

  // Not read when the first failed: refusing has to stay linear.
  if (first === undefined) {
    return undefined;
  }

  const second = hasKey(value, 'second')
    ? parseLayout(value.second, depth + 1, first.leaves)
    : undefined;

  if (second === undefined) {
    return undefined;
  }

  const fixed = hasKey(value, 'fixed') ? parseFixed(value.fixed) : undefined;

  return {
    node: {
      kind: 'split',
      axis: value.axis,
      ratio: clampRatio(numberField(value, 'ratio') ?? 0.5),
      ...(fixed === undefined ? {} : { fixed }),
      first: first.node,
      second: second.node,
    },
    leaves: second.leaves,
  };
};
