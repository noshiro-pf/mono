import { Arr, Num, Result } from 'ts-data-forge';

/** One saved split view, as the list knows it. */
export type ListEntry = Readonly<{
  /** The `<id>` of `workspace:<id>`, and the `ws=` of its URL. */
  id: string;
  /** The user's; the number shown for it is its position, not this. */
  name: string;
  createdAt: number;
  /** Whether the tab it was last seen in was pinned (spec W8). */
  pinned: boolean;
}>;

/**
 * The saved split views, in order, as stored under `workspaceRegistry`
 * (contract C2). Position `n` is what `Alt+n` selects and the favicon shows.
 */
export type SplitViewList = Readonly<{
  version: 1;
  entries: readonly ListEntry[];
  /** What a `split.html` with no `ws` opens: the one looked at last. */
  activeId: string | undefined;
}>;

export const emptyList: SplitViewList = {
  version: 1,
  entries: [],
  activeId: undefined,
} as const;

/** The id the first split view of a fresh profile gets. */
export const defaultWorkspaceId = 'default';

export const entryOf = (
  list: SplitViewList,
  id: string,
): ListEntry | undefined => list.entries.find((entry) => entry.id === id);

/** 1-based. */
export const positionOf = (
  list: SplitViewList,
  id: string,
): number | undefined => {
  const index = list.entries.findIndex((entry) => entry.id === id);

  return index === -1 ? undefined : index + 1;
};

export const entryAt = (
  list: SplitViewList,
  position: number,
): ListEntry | undefined => list.entries[position - 1];

export const addEntry = (
  list: SplitViewList,
  entry: ListEntry,
): SplitViewList =>
  entryOf(list, entry.id) === undefined
    ? ({ ...list, entries: Arr.toPushed(list.entries, entry) } as const)
    : list;

/**
 * Drops an entry. A dropped `activeId` moves to the entry that takes its place,
 * as closing a tab does, and is `undefined` only when the list is empty.
 */
export const removeEntry = (list: SplitViewList, id: string): SplitViewList => {
  const index = list.entries.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return list;
  }

  const entries = list.entries.filter((entry) => entry.id !== id);

  return {
    ...list,
    entries,
    activeId:
      list.activeId === id
        ? entries[Math.min(index, entries.length - 1)]?.id
        : list.activeId,
  };
};

/** Renames an entry. A name that is blank once trimmed is refused. */
export const renameEntry = (
  list: SplitViewList,
  id: string,
  name: string,
): SplitViewList => {
  const trimmed = name.trim();

  const entry = entryOf(list, id);

  return trimmed === '' || entry === undefined || entry.name === trimmed
    ? list
    : updateEntry(list, { ...entry, name: trimmed });
};

/** Moves an entry `offset` places, clamped at both ends. */
export const moveEntry = (
  list: SplitViewList,
  id: string,
  offset: number,
): SplitViewList => {
  const index = list.entries.findIndex((entry) => entry.id === id);

  const moving = list.entries[index];

  if (moving === undefined) {
    return list;
  }

  const target = Math.min(list.entries.length - 1, Math.max(0, index + offset));

  if (target === index) {
    return list;
  }

  const without = list.entries.filter((entry) => entry.id !== id);

  return {
    ...list,
    entries: [...without.slice(0, target), moving, ...without.slice(target)],
  };
};

export const activateEntry = (
  list: SplitViewList,
  id: string,
): SplitViewList =>
  list.activeId === id || entryOf(list, id) === undefined
    ? list
    : ({ ...list, activeId: id } as const);

export const setEntryPinned = (
  list: SplitViewList,
  id: string,
  pinned: boolean,
): SplitViewList => {
  const entry = entryOf(list, id);

  return entry === undefined || entry.pinned === pinned
    ? list
    : updateEntry(list, { ...entry, pinned });
};

/**
 * `split-view-<n>` for the smallest `n` no entry is named after, so that a name
 * freed by a delete is the next one handed out.
 */
export const nextName = (list: SplitViewList): string => {
  const used = new Set(
    list.entries
      .map((entry) => defaultNamePattern.exec(entry.name)?.[1])
      .filter((digits) => digits !== undefined)
      .map((digits) => Result.unwrapOkOr(Num.safeParseInt(digits), Number.NaN)),
  );

  const firstUnused = (candidate: number): number =>
    used.has(candidate) ? firstUnused(candidate + 1) : candidate;

  return `split-view-${firstUnused(1).toString()}`;
};

/** A name that no entry has, keeping `candidate` when it is free. */
export const uniqueName = (list: SplitViewList, candidate: string): string =>
  list.entries.some((entry) => entry.name === candidate)
    ? nextName(list)
    : candidate;

/**
 * The list rebuilt from the stored records, when there is none (spec S3):
 * `default` first, then the newest first, named by position.
 */
export const listFromRecords = (
  records: readonly Readonly<{ id: string; savedAt: number }>[],
): SplitViewList => {
  const ordered = [
    ...records.filter((record) => record.id === defaultWorkspaceId),
    ...Arr.toSorted(
      records.filter((record) => record.id !== defaultWorkspaceId),
      (a, b) => b.savedAt - a.savedAt,
    ),
  ] as const;

  return {
    version: 1,
    entries: ordered.map((record, index) => ({
      id: record.id,
      name: `split-view-${(index + 1).toString()}`,
      createdAt: record.savedAt,
      pinned: false,
    })),
    activeId: ordered[0]?.id,
  };
};

/**
 * The list a page settles on at load (spec U3), and the split view it shows:
 * the URL's id, added to the list when it is not on it; else the active one;
 * else a first entry, `default`. `activate` is whether the tab is visible: a
 * tab loading behind another does not become "the one looked at last".
 */
export const resolveShown = (
  list: SplitViewList,
  request: Readonly<{ id: string | undefined; name: string | undefined }>,
  now: number,
  activate: boolean,
): Readonly<{ list: SplitViewList; id: string }> => {
  const withRequested =
    request.id === undefined || entryOf(list, request.id) !== undefined
      ? list
      : addEntry(list, {
          id: request.id,
          name: request.name ?? nextName(list),
          createdAt: now,
          pinned: false,
        });

  const withFirst = Arr.isNonEmpty(withRequested.entries)
    ? withRequested
    : addEntry(withRequested, {
        id: defaultWorkspaceId,
        name: nextName(withRequested),
        createdAt: now,
        pinned: false,
      });

  const id =
    request.id ??
    (withFirst.activeId !== undefined &&
    entryOf(withFirst, withFirst.activeId) !== undefined
      ? withFirst.activeId
      : (withFirst.entries[0]?.id ?? defaultWorkspaceId));

  return { list: activate ? activateEntry(withFirst, id) : withFirst, id };
};

const defaultNamePattern = /^split-view-(\d+)$/u;

/**
 * A backup merged into the list by id (spec W6): an id on the list keeps its
 * place and takes the backup's name unless another entry has it, a new id is
 * appended under a name no other entry has, and nothing is removed — so
 * importing twice is a no-op.
 */
export const mergeImported = (
  list: SplitViewList,
  imported: readonly Readonly<{ id: string; name: string }>[],
  now: number,
): Readonly<{ list: SplitViewList; added: number; replaced: number }> =>
  ({
    list: imported.reduce(
      (acc, { id, name }) =>
        entryOf(acc, id) === undefined
          ? addEntry(acc, {
              id,
              name: uniqueName(acc, name),
              createdAt: now,
              pinned: false,
            })
          : // A name another entry has gets the next one free of the others
            // (spec W6), which a second import of the same backup keeps.
            renameEntry(
              acc,
              id,
              acc.entries.some(
                (other) => other.id !== id && other.name === name,
              )
                ? nextName({
                    ...acc,
                    entries: acc.entries.filter((other) => other.id !== id),
                  })
                : name,
            ),
      list,
    ),
    // Counted by id: a backup that repeats one imports it once.
    added: uniqueIds(imported).filter((id) => entryOf(list, id) === undefined)
      .length,
    replaced: uniqueIds(imported).filter(
      (id) => entryOf(list, id) !== undefined,
    ).length,
  }) as const;

const uniqueIds = (
  entries: readonly Readonly<{ id: string }>[],
): readonly string[] => Arr.uniq(entries.map(({ id }) => id));

const updateEntry = (list: SplitViewList, next: ListEntry): SplitViewList =>
  ({
    ...list,
    entries: list.entries.map((entry) => (entry.id === next.id ? next : entry)),
  }) as const;
