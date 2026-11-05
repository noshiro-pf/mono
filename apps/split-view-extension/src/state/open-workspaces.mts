import { Num, Result } from 'ts-data-forge';
import { readOpenSplitViewTabs, splitViewPagePath } from '../shared/index.mjs';
import type { WorkspaceEntry } from './registry.mjs';

/** Opens one workspace in a tab of its own. */
export const openWorkspaceInNewTab = async (
  workspaceId: string,
): Promise<void> => {
  await openWorkspaceTab(workspaceId, false, true);
};

/** What opening them all came to, for the line the picker shows afterwards. */
export type OpenedWorkspaces = Readonly<{
  opened: number;
  alreadyOpen: number;
}>;

/**
 * Opens every saved split view in a tab of its own, and says what it did.
 *
 * A workspace already open in a tab is left where it is rather than opened a
 * second time: two tabs on one workspace both save the layout it holds, so the
 * one closed last would write over whatever the other had been doing. Which
 * workspaces those are comes from the session record the pages keep, checked
 * against the browser here — an entry can outlive its tab, and opening nothing
 * because of a tab that is gone would be the worse mistake of the two.
 *
 * A split view last seen in a pinned tab comes back pinned. Chrome puts pinned
 * tabs at the front of the strip itself, so the rest arrive in the order of the
 * list — which is the order their `Alt+N` are in.
 *
 * `frontId` is the one to bring to the front when it is among those opened;
 * the rest open behind it. Without one, every tab opens behind the current one.
 */
export const openEveryWorkspaceInTabs = async (
  entries: readonly WorkspaceEntry[],
  frontId?: string,
): Promise<OpenedWorkspaces> => {
  const tabs = workspaceTabsToOpen(entries, await openWorkspaceIds(), frontId);

  // One after another rather than all at once, so that the tabs land in the
  // order of the list rather than in the order the browser got round to them.
  await tabs.reduce<Promise<void>>(
    async (previous, { workspaceId, pinned, active }) => {
      await previous;

      await openWorkspaceTab(workspaceId, pinned, active);
    },
    Promise.resolve(),
  );

  return {
    opened: tabs.length,
    alreadyOpen: entries.length - tabs.length,
  } as const;
};

/**
 * Whether any saved split view is open in a tab now, tabs that have gone not
 * counted. None is what an extension update or a browser restart that did not
 * restore the tabs leaves behind.
 */
export const isAnyWorkspaceOpen = async (): Promise<boolean> => {
  const openIds = await openWorkspaceIds();

  return openIds.size > 0;
};

/** One tab `openEveryWorkspaceInTabs` is about to open. */
export type WorkspaceTabToOpen = Readonly<{
  workspaceId: string;
  pinned: boolean;
  active: boolean;
}>;

/**
 * The tabs opening every split view comes to: the list in its order, less the
 * ones already open, with `frontId` the one active tab.
 */
export const workspaceTabsToOpen = (
  entries: readonly WorkspaceEntry[],
  alreadyOpen: ReadonlySet<string>,
  frontId: string | undefined,
): readonly WorkspaceTabToOpen[] =>
  entries
    .filter((entry) => !alreadyOpen.has(entry.id))
    .map((entry) => ({
      workspaceId: entry.id,
      pinned: entry.pinned,
      active: entry.id === frontId,
    }));

export const describeOpenedWorkspaces = ({
  opened,
  alreadyOpen,
}: OpenedWorkspaces): string => {
  if (opened === 0) {
    return alreadyOpen === 0
      ? 'There is no saved split view to open.'
      : 'Every saved split view is already open in a tab.';
  }

  const openedPart =
    opened === 1
      ? 'Opened one split view in a tab of its own.'
      : (`Opened ${opened.toString()} split views in tabs of their own.` as const);

  if (alreadyOpen === 0) {
    return openedPart;
  }

  return `${openedPart} ${
    alreadyOpen === 1
      ? ('One was' as const)
      : (`${alreadyOpen.toString()} were` as const)
  } already open.` as const;
};

/**
 * Whether a tab of the given id is open and still on the split view page.
 *
 * A tab the user navigated to another address keeps its open-tab record — only
 * closing the tab takes it off — so the tab existing is not enough.
 */
export const tabShowsSplitView = async (tabId: number): Promise<boolean> => {
  try {
    const tab = await chrome.tabs.get(tabId);

    return showsSplitView(tab, chrome.runtime.getURL(splitViewPagePath));
  } catch {
    // Closed, or closed while the service worker was asleep and never taken off
    // the list.
    return false;
  }
};

/**
 * Whether a tab is on the split view page, or on its way there: `url` is what
 * it shows, `pendingUrl` where it is navigating to. Any query and hash, so any
 * split view; a tab whose address cannot be read is not counted.
 */
export const showsSplitView = (
  tab: Readonly<{ url?: string; pendingUrl?: string }>,
  splitViewPageUrl: string,
): boolean => {
  const page = pageOf(splitViewPageUrl);

  return (
    page !== undefined &&
    [tab.url, tab.pendingUrl].some(
      (address) => address !== undefined && pageOf(address) === page,
    )
  );
};

/**
 * An address less its query and hash, or `undefined` for one that does not
 * parse.
 *
 * Not `origin`, which a URL parser outside the browser leaves `null` for every
 * `chrome-extension:` address; and `new URL` in a `try`, because `URL.parse`
 * is newer than the Chrome the manifest declares as its minimum.
 */
const pageOf = (address: string): string | undefined => {
  try {
    const { protocol, host, pathname } = new URL(address);

    return `${protocol}//${host}${pathname}`;
  } catch {
    return undefined;
  }
};

const tabIsOpen = async (tabId: string): Promise<boolean> => {
  const id = Result.unwrapOkOr(Num.safeParseFloat(tabId), Number.NaN);

  return Number.isSafeInteger(id) && tabShowsSplitView(id);
};

/**
 * The workspaces a tab is showing right now, tabs that have gone or navigated
 * away dropped.
 */
const openWorkspaceIds = async (): Promise<ReadonlySet<string>> => {
  const openTabs = await readOpenSplitViewTabs();

  const live = await Promise.all(
    Object.entries(openTabs).map(async ([tabId, workspaceId]) =>
      (await tabIsOpen(tabId)) ? workspaceId : undefined,
    ),
  );

  return new Set(live.filter((workspaceId) => workspaceId !== undefined));
};
