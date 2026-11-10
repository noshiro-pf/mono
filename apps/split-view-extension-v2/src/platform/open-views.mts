import { splitViewPagePath } from 'split-view-link';
import {
  encodeOpenView,
  liveOpenViews,
  openViewKeyOf,
  parseOpenViews,
  type OpenViewRecord,
} from '../core/index.mjs';

/**
 * Which tabs show which split view (spec T1): each page records its own tab in
 * session storage, and a record counts only while the browser says that tab
 * still holds this extension's page.
 */
export const recordOpenView = async (record: OpenViewRecord): Promise<void> => {
  await chrome.storage.session.set({
    [openViewKeyOf(record.tabId)]: encodeOpenView(record),
  });
};

export const forgetOpenView = async (tabId: number): Promise<void> => {
  await chrome.storage.session.remove(openViewKeyOf(tabId));
};

/** Follows a tab Chrome gave a new id: a discarded tab coming back. */
export const moveOpenView = async (
  fromTabId: number,
  toTabId: number,
): Promise<void> => {
  const record = parseOpenViews(
    await chrome.storage.session.get(openViewKeyOf(fromTabId)),
  )[0];

  if (record === undefined) {
    return;
  }

  await recordOpenView({ ...record, tabId: toTabId });

  await forgetOpenView(fromTabId);
};

/**
 * The records whose tab holds a split view page now: a live one, or one the
 * memory saver discarded, which has no document but is still the split view's
 * tab. A record left by a tab that navigated away, or closed while the worker
 * slept, does not count.
 */
export const readOpenViews = async (): Promise<readonly OpenViewRecord[]> => {
  const [stored, contexts, discarded] = await Promise.all([
    chrome.storage.session.get(null),
    chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.TAB],
    }),
    chrome.tabs.query({ discarded: true }),
  ]);

  const pageUrl = splitViewPageUrl();

  const liveTabIds = new Set<number>([
    ...contexts
      .filter((context) => context.documentUrl?.startsWith(pageUrl) === true)
      .map((context) => context.tabId),
    ...discarded
      .filter((tab) => tab.url?.startsWith(pageUrl) === true)
      .map((tab) => tab.id)
      .filter((id) => id !== undefined),
  ]);

  return liveOpenViews(parseOpenViews(stored), liveTabIds);
};

/** `chrome-extension://<id>/split.html`, with no query. */
export const splitViewPageUrl = (): string =>
  chrome.runtime.getURL(splitViewPagePath);
