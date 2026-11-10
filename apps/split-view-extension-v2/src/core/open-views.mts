import { Arr, hasKey, isRecord, isString, Num, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { ListEntry, SplitViewList } from './list.mjs';

/**
 * Which tabs show which split view (spec T1). Each page writes a record for its
 * own tab; a record counts only while its tab still holds an extension page,
 * which the worker asks the browser, so a tab that navigated elsewhere or
 * closed while the worker slept does not count.
 */
export type OpenViewRecord = Readonly<{
  tabId: number;
  workspaceId: string;
  /** When the tab was last shown; the toolbar goes back to the latest. */
  viewedAt: number;
}>;

/**
 * The session storage key of a tab's record: one key per tab, each written by
 * its own page only, so that tabs loading together do not overwrite each other.
 */
export const openViewKeyOf = (tabId: number): string =>
  `${openViewKeyPrefix}${tabId.toString()}` as const;

/** A tab's record as stored, without the tab id its key carries. */
export const encodeOpenView = (
  record: OpenViewRecord,
): Readonly<{ workspaceId: string; viewedAt: number }> =>
  ({
    workspaceId: record.workspaceId,
    viewedAt: record.viewedAt,
  }) as const;

/** Every record in the whole of session storage. */
export const parseOpenViews = (
  stored: ReadonlyRecord<string, unknown>,
): readonly OpenViewRecord[] =>
  Object.entries(stored)
    .map(([key, value]): OpenViewRecord | undefined => {
      const digits = openViewKeyPattern.exec(key)?.[1];

      const tabId =
        digits === undefined
          ? Number.NaN
          : Result.unwrapOkOr(Num.safeParseInt(digits), Number.NaN);

      return Number.isSafeInteger(tabId) &&
        isRecord(value) &&
        hasKey(value, 'workspaceId') &&
        hasKey(value, 'viewedAt') &&
        isString(value.workspaceId) &&
        typeof value.viewedAt === 'number'
        ? { tabId, workspaceId: value.workspaceId, viewedAt: value.viewedAt }
        : undefined;
    })
    .filter((record) => record !== undefined);

/** The records whose tab is among `liveTabIds`. */
export const liveOpenViews = (
  records: readonly OpenViewRecord[],
  liveTabIds: ReadonlySet<number>,
): readonly OpenViewRecord[] =>
  records.filter((record) => liveTabIds.has(record.tabId));

/** What the toolbar button does (spec T2). */
export type ToolbarPlan = Readonly<
  | { kind: 'focus'; tabId: number }
  | { kind: 'open-all'; frontId: string }
  | { kind: 'open-page' }
>;

export const toolbarPlanOf = (
  list: SplitViewList,
  open: readonly OpenViewRecord[],
): ToolbarPlan => {
  const latest = open.reduce<OpenViewRecord | undefined>(
    (best, record) =>
      best === undefined || record.viewedAt > best.viewedAt ? record : best,
    undefined,
  );

  if (latest !== undefined) {
    return { kind: 'focus', tabId: latest.tabId };
  }

  if (!Arr.isNonEmpty(list.entries)) {
    return { kind: 'open-page' };
  }

  return {
    kind: 'open-all',
    frontId:
      list.activeId !== undefined &&
      list.entries.some(({ id }) => id === list.activeId)
        ? list.activeId
        : list.entries[0].id,
  };
};

/** One tab "open all" is about to open. */
export type TabToOpen = Readonly<{
  workspaceId: string;
  pinned: boolean;
  active: boolean;
}>;

/** The list in order, less what is open, `frontId` the one active tab (spec W5). */
export const tabsToOpen = (
  entries: readonly ListEntry[],
  openIds: ReadonlySet<string>,
  frontId: string | undefined,
): readonly TabToOpen[] =>
  entries
    .filter((entry) => !openIds.has(entry.id))
    .map((entry) => ({
      workspaceId: entry.id,
      pinned: entry.pinned,
      active: entry.id === frontId,
    }));

export const describeOpened = (opened: number, alreadyOpen: number): string => {
  if (opened === 0) {
    return alreadyOpen === 0
      ? 'There is no saved split view to open.'
      : 'Every saved split view is already open in a tab.';
  }

  const openedPart =
    opened === 1
      ? 'Opened one split view in a tab of its own.'
      : (`Opened ${opened.toString()} split views in tabs of their own.` as const);

  return alreadyOpen === 0
    ? openedPart
    : `${openedPart} ${alreadyOpen === 1 ? 'One was' : `${alreadyOpen.toString()} were`} already open.`;
};

const openViewKeyPrefix = 'openView:';

const openViewKeyPattern = /^openView:(\d{1,9})$/u;
