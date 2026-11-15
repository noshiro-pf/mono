import {
  claudeSessionUrlOf,
  pullRequestSplitViewSearch,
  splitViewExtensionId,
  splitViewPagePath,
  splitViewPresencePath,
} from 'split-view-link';
import {
  asGitHubMessage,
  githubMessageTag,
  issueUrlOf,
  pullRequestOf,
  pullRequestWorkspace,
  type GitHubMessage,
} from './github/index.mjs';

/**
 * The service worker, for what the pull request content script
 * (`pull-request-buttons.mts`) cannot do itself: find out whether Split View is
 * installed, and open a pull request in it — from the content script's button,
 * or from the context menu.
 *
 * Split View is another extension, `apps/split-view-extension`, reached by the
 * id the `key` in its manifest pins on an unpacked build (`split-view-link`).
 * `chrome.tabs.create` opens another extension's page as the address bar would;
 * a web page could not, which is why the content script asks for it here.
 *
 * Listeners are registered at the top level: a service worker is woken by the
 * event, so a listener added later than the first turn of the event loop is a
 * listener that misses it.
 */
chrome.runtime.onInstalled.addListener(() => {
  syncContextMenus({ force: true }).catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  syncContextMenus({ force: true }).catch(console.error);
});

chrome.runtime.onMessage.addListener((value: unknown, sender, sendResponse) => {
  const message = asGitHubMessage(value);

  if (message?.kind === 'open') {
    // Answered once the tab is open, so that the button is ready again only
    // then. A tab closed by it has nobody left to answer.
    openPullRequest(message, sender.tab)
      .catch(console.error)
      .finally(() => {
        sendResponse(undefined);
      });

    return true;
  }

  if (message?.kind !== 'split-view-installed') {
    return undefined;
  }

  // Each pull request page asks once, so this is also what puts the context
  // menu up once Split View has been installed, or takes it down once removed.
  syncContextMenus({ force: false })
    .then(sendResponse)
    .catch((error: unknown) => {
      console.error(error);

      sendResponse(false);
    });

  // Either answer is sent later.
  return true;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (
    info.menuItemId !== linkMenuItemId &&
    info.menuItemId !== pageMenuItemId
  ) {
    return;
  }

  const url = info.menuItemId === linkMenuItemId ? info.linkUrl : info.pageUrl;

  if (url !== undefined) {
    openPullRequestFromMenu(url, info.pageUrl, tab).catch(console.error);
  }
});

/**
 * Whether Split View is installed: whether the file it lists for every
 * extension to fetch answers. When it is not installed, or is a build from the
 * Chrome Web Store, whose id is its own, the fetch fails.
 */
const isSplitViewInstalled = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      `chrome-extension://${splitViewExtensionId}/${splitViewPresencePath}`,
      { method: 'HEAD' },
    );

    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Opens a pull request in a split view, in a new tab beside the one it was
 * asked from, and closes that one when the message asks for it.
 *
 * The tab is closed only after the split view's tab has been created, so a
 * failure to open leaves the user where they were; the closed tab is in
 * Chrome's recently closed list like any other.
 *
 * The addresses were read off a web page, so they are checked again here:
 * nothing but a pull request on github.com is opened, and nothing but an issue
 * there and a Claude Code session is put beside it.
 */
const openPullRequest = async (
  message: Extract<GitHubMessage, Readonly<{ kind: 'open' }>>,
  openerTab: OpenerTab | undefined,
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
    url: `chrome-extension://${splitViewExtensionId}/${splitViewPagePath}${search}`,
    active: message.active,
    ...(openerTab?.id === undefined
      ? {}
      : {
          openerTabId: openerTab.id,
          windowId: openerTab.windowId,
          index: openerTab.index + 1,
        }),
  });

  if (message.closeOpener && openerTab?.id !== undefined) {
    await chrome.tabs.remove(openerTab.id);
  }
};

/** What of the tab a pull request was asked from the new tab is put beside. */
type OpenerTab = Readonly<Pick<chrome.tabs.Tab, 'id' | 'index' | 'windowId'>>;

/**
 * The context menu's item was chosen on a pull request.
 *
 * The title, the issue and the session are read by the content script, which is
 * asked to do so and answers with an `open`, so the split view is the button's,
 * and the PR Manager's. A tab it is not in — a link to a pull request on another
 * site, or a GitHub tab loaded before the extension was — refuses the message,
 * and the pull request is opened with what the address alone says.
 *
 * Whether the menu was opened on GitHub is read off `pageUrl`, which the menu
 * reports without the `tabs` permission that `tab.url` would need.
 */
const openPullRequestFromMenu = async (
  url: string,
  pageUrl: string | undefined,
  tab: OpenerTab | undefined,
): Promise<void> => {
  if (pullRequestOf(url) === undefined) {
    return;
  }

  const lookUp: GitHubMessage = {
    tag: githubMessageTag,
    kind: 'look-up',
    url,
  } as const;

  if (tab?.id !== undefined && pageUrl?.startsWith(gitHubOrigin) === true) {
    // The content script answers `true` at once and opens the split view
    // itself. An answer is needed: a message left unanswered rejects here as
    // "the message port closed", like a tab with no content script, and would
    // open the pull request a second time.
    const taken: unknown = await chrome.tabs
      .sendMessage(tab.id, lookUp, { frameId: 0 })
      .catch(() => false);

    if (taken === true) {
      return;
    }

    // No content script in that tab; open it with what is known.
  }

  await openPullRequest(
    {
      tag: githubMessageTag,
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

const replaceContextMenus = async (force: boolean): Promise<boolean> => {
  const installed = await isSplitViewInstalled();

  // A page asking finds the items as the last run left them, unless Split View
  // has come or gone since. A worker started afresh does not know what the last
  // run left, and builds them once.
  if (!force && mut_workerState.menusShown === installed) {
    return installed;
  }

  // Before the next `await`: the runs are queued one after another, so nothing
  // else reads or writes it between the check above and here.
  mut_workerState.menusShown = installed;

  await chrome.contextMenus.removeAll();

  if (!installed) {
    return false;
  }

  chrome.contextMenus.create({
    id: linkMenuItemId,
    title: 'Open pull request in Split View',
    contexts: ['link'],
    targetUrlPatterns: [pullRequestUrlPattern],
  });

  chrome.contextMenus.create({
    id: pageMenuItemId,
    title: 'Open this pull request in Split View',
    contexts: ['page'],
    documentUrlPatterns: [pullRequestUrlPattern],
  });

  return true;
};

/**
 * Puts the context menu's items up when Split View is installed and takes them
 * down when it is not, and says which.
 *
 * Run on install and on startup (`force`), which is when Chrome forgets them,
 * and each time a pull request page asks, so that installing or removing Split
 * View is followed without a restart; a page's run changes them only when that
 * has happened. They are removed first because an update keeps them in some
 * versions, and creating an id twice is an error. The runs are queued one after
 * another, because an update applied at startup fires both events, and two runs
 * interleaved would create every id twice.
 */
const syncContextMenus = async ({
  force,
}: Readonly<{ force: boolean }>): Promise<boolean> => {
  const run = mut_workerState.menuQueue
    // A run that failed has logged its error; the next one starts regardless.
    .catch(() => false)
    .then(async () => replaceContextMenus(force));

  mut_workerState.menuQueue = run;

  return run;
};

const linkMenuItemId = 'open-pull-request-link';

const pageMenuItemId = 'open-pull-request-page';

/**
 * What Chrome shows the items for. Wider than a pull request — a match pattern
 * cannot say "digits" — and narrowed by `pullRequestOf` on the click.
 */
const pullRequestUrlPattern = 'https://github.com/*/*/pull/*';

const gitHubOrigin = 'https://github.com/';

/**
 * The tail of the context menu's re-creation, and whether the last run put the
 * items up (`undefined` until a run in this worker has). An object, because the
 * lint rules allow a `mut_`-prefixed property to be assigned but not a
 * top-level binding.
 */
const mut_workerState: {
  menuQueue: Promise<boolean>;
  menusShown: boolean | undefined;
} = {
  menuQueue: Promise.resolve(false),
  menusShown: undefined,
};
