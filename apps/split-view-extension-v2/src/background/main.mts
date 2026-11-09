import {
  claudeSessionUrlOf,
  pullRequestSplitViewSearch,
} from 'split-view-link';
import {
  asGitHubMessage,
  asListRequest,
  asPaneId,
  asResetOriginRequest,
  githubTag,
  isSplitViewPage,
  issueUrlOf,
  pullRequestOf,
  pullRequestUrlPattern,
  pullRequestWorkspace,
  splitMenuItems,
  splitMenuTitle,
  splitOpenQuery,
  splitOpenRequestOf,
  toolbarPlanOf,
  workerTag,
  type GitHubMessage,
  type ListReply,
  type PaneOfFrameQuery,
  type ResetOriginsReply,
  type SplitDirection,
} from '../core/index.mjs';
import {
  applyStoredListOp,
  applyStoredResetOrigin,
  ensureInitiatorRule,
  ensureTabRule,
  focusTab,
  forgetOpenView,
  hasTabRule,
  installInitiatorRule,
  moveOpenView,
  moveTabRule,
  openAllSplitViews,
  pruneStoredWorkspaces,
  readList,
  readOpenViews,
  removeTabRule,
  splitViewPageUrl,
} from '../platform/index.mjs';

/**
 * The service worker: the events no page sees. The toolbar button, install, the
 * context menus, a pull request asked for from GitHub, and tabs closing or
 * changing id. The page manages its own tab's rule, since it knows its tab.
 *
 * Every listener is added in the first turn: a worker woken by an event misses
 * it when the listener is added later.
 */
chrome.action.onClicked.addListener(() => {
  openFromToolbar().catch(console.error);
});

chrome.runtime.onInstalled.addListener((details) => {
  // Replaced, not just asserted: an update may have changed it.
  installInitiatorRule().catch(console.error);

  recreateMenus().catch(console.error);

  pruneStoredWorkspaces().catch(console.error);

  if (details.reason === 'install') {
    openFromToolbar().catch(console.error);
  }
});

chrome.runtime.onStartup.addListener(() => {
  ensureInitiatorRule().catch(console.error);

  // Again on startup, so that the titles follow Chrome's UI language.
  recreateMenus().catch(console.error);

  pruneStoredWorkspaces().catch(console.error);
});

chrome.runtime.onMessage.addListener((value: unknown, sender) => {
  const message = asGitHubMessage(value);

  // Never from incognito, as `openInSplit` says.
  if (message?.kind === 'open' && sender.tab?.incognito !== true) {
    openPullRequest(message, sender.tab).catch(console.error);
  }
});

// The saved list's and the always-clear list's one writer (spec W10), for this
// extension's own pages only: a content script's sender is the site it runs in.
chrome.runtime.onMessage.addListener(
  (
    value: unknown,
    sender,
    sendResponse: (answer: ListReply | ResetOriginsReply | undefined) => void,
  ) => {
    if (
      sender.id !== chrome.runtime.id ||
      !isSplitViewPage(sender.url, splitViewPageUrl())
    ) {
      return false;
    }

    const listRequest = asListRequest(value);

    const originRequest = asResetOriginRequest(value);

    const reply =
      listRequest !== undefined
        ? applyStoredListOp(listRequest.op)
        : originRequest !== undefined
          ? applyStoredResetOrigin(originRequest.origin, originRequest.enabled)
          : undefined;

    if (reply === undefined) {
      return false;
    }

    reply.then(sendResponse).catch((error: unknown) => {
      console.error(error);

      // Answered all the same, so that the page falls back at once.
      sendResponse(undefined);
    });

    // The answer comes later.
    return true;
  },
);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  onMenuClicked(info, tab).catch(console.error);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  // A page cannot take its own record away: its tab is gone first.
  Promise.all([forgetOpenView(tabId), removeTabRule(tabId)]).catch(
    console.error,
  );
});

// A tab that leaves the split view keeps no framing rule: the next page in it
// would have its frames' "do not frame me" headers taken away too (spec F2).
// Coming back, the page installs the rule again. Chrome takes no event filter
// here, so a navigation in any tab costs one read of the session rules; the
// page's own `replaceState` on every save costs nothing.
chrome.tabs.onUpdated.addListener((tabId, change) => {
  if (
    change.url !== undefined &&
    !isSplitViewPage(change.url, splitViewPageUrl())
  ) {
    leaveSplitView(tabId).catch(console.error);
  }
});

chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  Promise.all([
    moveTabRule(removedTabId, addedTabId),
    moveOpenView(removedTabId, addedTabId),
  ]).catch(console.error);
});

type OpenerTab = Readonly<
  Pick<chrome.tabs.Tab, 'id' | 'index' | 'windowId'> & {
    url?: string;
    title?: string;
    incognito: boolean;
    pinned: boolean;
  }
>;

type MenuClick = Readonly<
  Pick<
    chrome.contextMenus.OnClickData,
    'frameId' | 'frameUrl' | 'linkUrl' | 'menuItemId' | 'pageUrl'
  >
>;

const pullRequestMenuIds = {
  link: 'open-pull-request-link',
  page: 'open-pull-request-page',
} as const;

const webPagePatterns = ['http://*/*', 'https://*/*'] as const;

const gitHubOrigin = 'https://github.com/';

const mut_menuQueue: { current: Promise<void> } = {
  current: Promise.resolve(),
};

const showsSplitView = async (tabId: number): Promise<boolean> => {
  const tab = await chrome.tabs.get(tabId);

  return isSplitViewPage(tab.pendingUrl ?? tab.url, splitViewPageUrl());
};

/**
 * Takes a tab's rule away once it shows something other than the split view.
 * Its open-view record can stay: it counts only while the tab holds the page
 * (spec T1). The page coming back puts the rule back, and a worker woken late
 * for the event may remove it after that, so the tab is asked again afterwards,
 * and a tab that is back gets its rule again.
 */
const leaveSplitView = async (tabId: number): Promise<void> => {
  if (!(await hasTabRule(tabId)) || (await showsSplitView(tabId))) {
    return;
  }

  await removeTabRule(tabId);

  if (await showsSplitView(tabId)) {
    await ensureTabRule(tabId);
  }
};

/**
 * The toolbar button (spec T2): the split view viewed last when one is open;
 * otherwise every saved one, the active one in front; otherwise a new page.
 */
const openFromToolbar = async (): Promise<void> => {
  const [list, open] = await Promise.all([readList(), readOpenViews()]);

  const plan = toolbarPlanOf(list, open);

  switch (plan.kind) {
    case 'focus':
      if (await focusTab(plan.tabId)) {
        return;
      }

      await openAllSplitViews(list, list.activeId);

      return;

    case 'open-all':
      await openAllSplitViews(list, plan.frontId);

      return;

    case 'open-page':
      await chrome.tabs.create({ url: splitViewPageUrl() });
  }
};

const besideTab = (
  tab: Pick<OpenerTab, 'id' | 'index' | 'windowId'> | undefined,
): Readonly<{ openerTabId?: number; windowId?: number; index?: number }> =>
  tab?.id === undefined
    ? ({} as const)
    : ({
        openerTabId: tab.id,
        windowId: tab.windowId,
        index: tab.index + 1,
      } as const);

/**
 * A pull request in the GitHub split view (spec G1, G3), beside the tab that
 * asked, which is closed once the new tab exists when the message says so.
 * The addresses were read off a web page, so each is checked again here.
 */
const openPullRequest = async (
  message: Extract<GitHubMessage, Readonly<{ kind: 'open' }>>,
  opener: Pick<OpenerTab, 'id' | 'index' | 'pinned' | 'windowId'> | undefined,
): Promise<void> => {
  const pullRequest = pullRequestOf(message.url);

  if (pullRequest === undefined) {
    return;
  }

  const search = pullRequestSplitViewSearch({
    workspace: pullRequestWorkspace,
    pullRequest,
    title: message.title,
    issueUrl:
      message.issueUrl === undefined ? undefined : issueUrlOf(message.issueUrl),
    sessionUrl:
      message.sessionUrl === undefined
        ? undefined
        : claudeSessionUrlOf(message.sessionUrl),
  });

  await chrome.tabs.create({
    url: `${splitViewPageUrl()}${search}`,
    active: message.active,
    ...besideTab(opener),
  });

  // A pinned tab stays, as `openInSplit` keeps it: the split view cannot take
  // its place in the strip.
  if (message.closeOpener && opener?.id !== undefined && !opener.pinned) {
    await chrome.tabs.remove(opener.id);
  }
};

/**
 * The pull request menu items (spec M1). On github.com the content script reads
 * the title, the issue and the session and answers with an `open`; a tab with
 * no content script refuses, and the address alone is opened.
 */
const openPullRequestFromMenu = async (
  url: string,
  tab: OpenerTab | undefined,
): Promise<void> => {
  // Never from incognito, as `openInSplit` says.
  if (pullRequestOf(url) === undefined || tab?.incognito === true) {
    return;
  }

  if (tab?.id !== undefined && tab.url?.startsWith(gitHubOrigin) === true) {
    const lookUp: GitHubMessage = {
      tag: githubTag,
      kind: 'look-up',
      url,
    } as const;

    try {
      const handled: unknown = await chrome.tabs.sendMessage(tab.id, lookUp, {
        frameId: 0,
      });

      if (handled === true) {
        return;
      }
    } catch {
      // No content script in that tab.
    }
  }

  await openPullRequest(
    {
      tag: githubTag,
      kind: 'open',
      url,
      title: undefined,
      issueUrl: undefined,
      sessionUrl: undefined,
      active: true,
      closeOpener: false,
    },
    tab,
  );
};

/**
 * "Open in a split" (spec M2). In a split view, the pane the menu was opened in
 * splits — asked of its frame; a nested frame cannot say, and the page then
 * splits its active pane. Elsewhere a new split view of the page and the link
 * takes the tab's place. Never from incognito: the page would open in a normal
 * window and keep the private page's address in the list for good.
 */
const openInSplit = async (
  direction: SplitDirection,
  info: MenuClick,
  tab: OpenerTab | undefined,
): Promise<void> => {
  if (tab?.id === undefined || tab.incognito) {
    return;
  }

  if (isSplitViewPage(tab.url ?? info.pageUrl, splitViewPageUrl())) {
    const paneQuery: PaneOfFrameQuery = {
      tag: workerTag,
      kind: 'pane-of-frame',
    } as const;

    const answer: unknown =
      info.frameId === undefined
        ? undefined
        : await chrome.tabs
            .sendMessage(tab.id, paneQuery, { frameId: info.frameId })
            .catch(() => undefined);

    const request = splitOpenRequestOf({
      direction,
      tabId: tab.id,
      paneId: asPaneId(answer),
      linkUrl: info.linkUrl,
    });

    if (request !== undefined) {
      // Only the page in `tabId` acts, and none answers: a closed port is fine.
      await chrome.runtime.sendMessage(request).catch(() => undefined);
    }

    return;
  }

  const query = splitOpenQuery({
    direction,
    pageUrl: info.pageUrl,
    linkUrl: info.linkUrl,
    tabTitle: tab.title,
  });

  if (query === undefined) {
    return;
  }

  // Created first, so that a failure leaves the user where they were.
  await chrome.tabs.create({
    url: `${splitViewPageUrl()}${query}`,
    ...besideTab(tab),
  });

  // A pinned tab stays: the split view cannot take its place in the strip.
  if (!tab.pinned) {
    await chrome.tabs.remove(tab.id);
  }
};

const onMenuClicked = async (
  info: MenuClick,
  tab: OpenerTab | undefined,
): Promise<void> => {
  const direction = splitMenuItems.find(
    (item) => item.id === info.menuItemId,
  )?.direction;

  if (direction !== undefined) {
    await openInSplit(direction, info, tab);

    return;
  }

  const url =
    info.menuItemId === pullRequestMenuIds.link
      ? info.linkUrl
      : info.menuItemId === pullRequestMenuIds.page
        ? // The menu matches the frame clicked in, a pane among them.
          (info.frameUrl ?? info.pageUrl)
        : undefined;

  if (url !== undefined) {
    await openPullRequestFromMenu(url, tab);
  }
};

const createMenus = async (): Promise<void> => {
  await chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: pullRequestMenuIds.link,
    title: 'Open pull request in Split View',
    contexts: ['link'],
    targetUrlPatterns: [pullRequestUrlPattern],
  });

  chrome.contextMenus.create({
    id: pullRequestMenuIds.page,
    title: 'Open this pull request in Split View',
    contexts: ['page'],
    documentUrlPatterns: [pullRequestUrlPattern],
  });

  const uiLanguage = chrome.i18n.getUILanguage();

  for (const item of splitMenuItems) {
    chrome.contextMenus.create({
      id: item.id,
      title: splitMenuTitle(item.direction, uiLanguage),
      // Not on a selection or a text field: outside a split view the tab
      // closes, with what was typed. Not on media, whose `src` is what
      // `targetUrlPatterns` would match.
      contexts: ['link', 'page'],
      // Matched against the frame the menu is in, so panes get it too.
      documentUrlPatterns: Array.from(webPagePatterns),
      targetUrlPatterns: Array.from(webPagePatterns),
    });
  }
};

/**
 * Removes and creates every item. Runs are queued, because an update applied at
 * startup fires install and startup both, and two runs interleaved would create
 * each id twice.
 */
const recreateMenus = async (): Promise<void> => {
  mut_menuQueue.current = mut_menuQueue.current
    .catch(() => undefined)
    .then(createMenus);

  return mut_menuQueue.current;
};
