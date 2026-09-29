import { isString } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { splitViewOpenTabKeyPrefix } from './constants.mjs';

/**
 * Which tab is showing which saved split view, for this browser session.
 *
 * Written by each page when it settles on a workspace, and cleaned up by the
 * service worker when a tab goes. `chrome.tabs.query({ url })` would answer the
 * same question, and filtering by URL needs the `tabs` permission; this needs
 * none, which is the trade the split view's own tab id is already recorded for.
 *
 * One key per tab, and each writer touches its own key only. A single record
 * read, changed and written back by every tab lost entries whenever several
 * tabs loaded at once — opening every split view is exactly that — and until a
 * lost entry was written again, its split view counted as not open, so opening
 * them all a second time opened it twice. The reader below still checks every
 * entry against the browser, since an entry can outlive its tab.
 */
export type OpenSplitViewTabs = ReadonlyRecord<string, string>;

export const readOpenSplitViewTabs = async (): Promise<OpenSplitViewTabs> => {
  const stored = await chrome.storage.session.get(null);

  return openSplitViewTabsFrom(stored);
};

export const recordOpenSplitViewTab = async (
  tabId: number,
  workspaceId: string,
): Promise<void> => {
  const key = openSplitViewTabKey(tabId);

  const stored = await chrome.storage.session.get(key);

  if (stored[key] === workspaceId) {
    return;
  }

  await chrome.storage.session.set({ [key]: workspaceId });
};

export const forgetOpenSplitViewTab = async (tabId: number): Promise<void> => {
  await chrome.storage.session.remove(openSplitViewTabKey(tabId));
};

/**
 * Follows a tab that Chrome has given a new id — a discarded tab coming back —
 * so that the split view in it is still recognized as open.
 */
export const moveOpenSplitViewTab = async (
  fromTabId: number,
  toTabId: number,
): Promise<void> => {
  const fromKey = openSplitViewTabKey(fromTabId);

  const stored = await chrome.storage.session.get(fromKey);

  const workspaceId: unknown = stored[fromKey];

  if (!isString(workspaceId)) {
    return;
  }

  await chrome.storage.session.set({
    [openSplitViewTabKey(toTabId)]: workspaceId,
  });

  await chrome.storage.session.remove(fromKey);
};

export const openSplitViewTabKey = (tabId: number): string =>
  `${splitViewOpenTabKeyPrefix}${String(tabId)}` as const;

/** The tabs recorded in the whole of session storage, keyed by tab id. */
export const openSplitViewTabsFrom = (
  stored: ReadonlyRecord<string, unknown>,
): OpenSplitViewTabs =>
  Object.fromEntries(
    Object.entries(stored).flatMap(([key, workspaceId]) =>
      key.startsWith(splitViewOpenTabKeyPrefix) && isString(workspaceId)
        ? ([
            [key.slice(splitViewOpenTabKeyPrefix.length), workspaceId],
          ] as const)
        : [],
    ),
  );
