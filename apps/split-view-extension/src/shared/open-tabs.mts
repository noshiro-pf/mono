import { hasKey, isRecord, isString, Obj } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { splitViewOpenTabsSessionKey } from './constants.mjs';

/**
 * Which tab is showing which saved split view, for this browser session.
 *
 * Written by each page when it settles on a workspace, and cleaned up by the
 * service worker when a tab goes. `chrome.tabs.query({ url })` would answer the
 * same question, and filtering by URL needs the `tabs` permission; this needs
 * none, which is the trade the split view's own tab id is already recorded for.
 *
 * Read-modify-write from several tabs at once can lose an entry. Nothing here
 * is worth a lock: a lost entry costs one duplicate tab, and the reader below
 * checks every entry against the browser anyway.
 */
export type OpenSplitViewTabs = ReadonlyRecord<string, string>;

export const readOpenSplitViewTabs = async (): Promise<OpenSplitViewTabs> => {
  const stored = await chrome.storage.session.get(splitViewOpenTabsSessionKey);

  const value: unknown = stored[splitViewOpenTabsSessionKey];

  if (!isRecord(value)) {
    return {};
  }

  return Obj.filter(value, isString);
};

export const recordOpenSplitViewTab = async (
  tabId: number,
  workspaceId: string,
): Promise<void> => {
  const openTabs = await readOpenSplitViewTabs();

  if (openTabs[String(tabId)] === workspaceId) {
    return;
  }

  await writeOpenSplitViewTabs({ ...openTabs, [String(tabId)]: workspaceId });
};

export const forgetOpenSplitViewTab = async (tabId: number): Promise<void> => {
  const openTabs = await readOpenSplitViewTabs();

  if (!hasKey(openTabs, String(tabId))) {
    return;
  }

  await writeOpenSplitViewTabs(withoutTab(openTabs, tabId));
};

/**
 * Follows a tab that Chrome has given a new id — a discarded tab coming back —
 * so that the split view in it is still recognized as open.
 */
export const moveOpenSplitViewTab = async (
  fromTabId: number,
  toTabId: number,
): Promise<void> => {
  const openTabs = await readOpenSplitViewTabs();

  const workspaceId = openTabs[String(fromTabId)];

  if (workspaceId === undefined) {
    return;
  }

  await writeOpenSplitViewTabs({
    ...withoutTab(openTabs, fromTabId),
    [String(toTabId)]: workspaceId,
  });
};

const writeOpenSplitViewTabs = async (
  openTabs: OpenSplitViewTabs,
): Promise<void> => {
  await chrome.storage.session.set({ [splitViewOpenTabsSessionKey]: openTabs });
};

const withoutTab = (
  openTabs: OpenSplitViewTabs,
  tabId: number,
): OpenSplitViewTabs =>
  Obj.filter(openTabs, (_workspaceId, key) => key !== String(tabId));
