import { workspaceQueryParam } from 'split-view-link';
import {
  encodeQueryValue,
  tabsToOpen,
  type SplitViewList,
} from '../core/index.mjs';
import { readOpenViews, splitViewPageUrl } from './open-views.mjs';

/** `split.html?ws=<id>`. */
export const splitViewUrlOf = (workspaceId: string): string =>
  `${splitViewPageUrl()}?${workspaceQueryParam}=${encodeQueryValue(workspaceId)}` as const;

/**
 * Opens every saved split view not open in a tab, in list order (spec W5):
 * `frontId` in front when it opens, the rest behind, pinned as they were last
 * seen. Tabs are created one at a time so that they keep the list's order.
 */
export const openAllSplitViews = async (
  list: SplitViewList,
  frontId: string | undefined,
): Promise<Readonly<{ opened: number; alreadyOpen: number }>> => {
  const open = await readOpenViews();

  const openIds = new Set<string>(open.map(({ workspaceId }) => workspaceId));

  const toOpen = tabsToOpen(list.entries, openIds, frontId);

  for (const tab of toOpen) {
    // eslint-disable-next-line no-await-in-loop -- in order, one after another
    await chrome.tabs.create({
      url: splitViewUrlOf(tab.workspaceId),
      active: tab.active,
      pinned: tab.pinned,
    });
  }

  return {
    opened: toOpen.length,
    alreadyOpen: list.entries.filter(({ id }) => openIds.has(id)).length,
  };
};

/** Brings a tab and its window to the front; whether the tab was there. */
export const focusTab = async (tabId: number): Promise<boolean> => {
  try {
    const tab = await chrome.tabs.update(tabId, { active: true });

    if (tab?.windowId !== undefined) {
      await chrome.windows.update(tab.windowId, { focused: true });
    }

    return tab !== undefined;
  } catch {
    // Closed between the record being read and now.
    return false;
  }
};
