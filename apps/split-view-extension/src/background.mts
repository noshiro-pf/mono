import { Arr } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import {
  asGitHubMessage,
  githubMessageTag,
  issueUrlOf,
  pullRequestOf,
  pullRequestSplitViewSearch,
  type GitHubMessage,
} from './github/index.mjs';
import {
  ensureInitiatorRule,
  eventLogSessionKey,
  forgetOpenSplitViewTab,
  headerRuleIdForTab,
  installHeaderRule,
  maxEventLogEntries,
  moveOpenSplitViewTab,
  removeHeaderRule,
  splitViewPagePath,
  splitViewTabIdSessionKey,
} from './shared/index.mjs';
import {
  isAnyWorkspaceOpen,
  loadWorkspaceRegistry,
  openEveryWorkspaceInTabs,
} from './state/index.mjs';

/**
 * The service worker.
 *
 * The split view manages its own header-stripping rule from the page, because
 * the page is what knows which tab it is in; the worker is here for the events
 * a page cannot see — the toolbar button being clicked, its own tab being
 * closed, and a pull request on GitHub asked to be opened in one, from the
 * content script's button or from the context menu.
 *
 * Listeners are registered at the top level: a service worker is woken by the
 * event, so a listener added later than the first turn of the event loop is a
 * listener that misses it.
 */
chrome.action.onClicked.addListener(() => {
  openSplitView().catch(console.error);
});

chrome.runtime.onInstalled.addListener((details) => {
  // The rule that covers every frame this extension opens. It is a *dynamic*
  // rule, so it outlives the browser session and does not depend on a page of
  // ours being open — but it is re-asserted here and on startup because an
  // extension update clears nothing else about it.
  ensureInitiatorRule().catch(console.error);

  createContextMenus().catch(console.error);

  if (details.reason === 'install') {
    openSplitView().catch(console.error);
  }
});

chrome.runtime.onStartup.addListener(() => {
  ensureInitiatorRule().catch(console.error);
});

chrome.runtime.onMessage.addListener((value: unknown, sender) => {
  const message = asGitHubMessage(value);

  if (message?.kind === 'open') {
    openPullRequest(message, sender.tab).catch(console.error);
  }
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
    openPullRequestFromMenu(url, tab).catch(console.error);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  forgetTab(tabId).catch(console.error);
});

/**
 * A tab's id is not permanent: Chrome's memory saver discards an idle tab and
 * the tab comes back with a **new** id, which is announced here. The tab-scoped
 * rule has to move with it — it is the only one that covers a navigation
 * started *inside* a pane, where the initiator is the site rather than us, and
 * a stale one shows up as a page that suddenly refuses to be framed.
 */
chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  moveHeaderRule(removedTabId, addedTabId).catch(console.error);
});

if (SPLIT_VIEW_DIAGNOSTICS) {
  /**
   * Everything the diagnostics panel needs in order to answer "did a rule act on
   * that request?" without anyone having to reproduce the failure twice.
   *
   * `onRuleMatchedDebug` fires for every rule this extension matches (unpacked
   * extensions with `declarativeNetRequestFeedback` only), and the navigation
   * events say what each pane's frame actually tried to load and what became of
   * it. Between them, a pane that will not load is either a request no rule
   * touched, or a request that was modified and still refused.
   */
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    appendEvent({
      kind: 'rule-matched',
      ruleId: info.rule.ruleId,
      ruleset: info.rule.rulesetId,
      tabId: info.request.tabId,
      type: info.request.type,
      url: info.request.url,
    }).catch(console.error);
  });
}

if (SPLIT_VIEW_DIAGNOSTICS) {
  /**
   * The network layer, observed read-only.
   *
   * `webRequest` here is a *diagnostic*, not part of how the split view works:
   * it is the only way to see what Chrome attributes a pane's request to
   * (`initiator`, `tabId`, `type`) and which framing headers are on the response
   * by the time it arrives. A pane that will not load is then answerable rather
   * than arguable. It can be dropped once the cause is known — see `docs/development.md`.
   */
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      logFrameEvent('request', details, undefined, {
        type: details.type,
        initiator: details.initiator ?? '(none)',
      }).catch(console.error);
    },
    { urls: ['<all_urls>'], types: ['sub_frame'] },
  );

  chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      const headers = details.responseHeaders ?? [];

      const named = (wanted: string): string =>
        headers
          .filter((header) => header.name.toLowerCase() === wanted)
          .map((header) => (header.value ?? '').slice(0, 60))
          .join(' | ');

      logFrameEvent('headers', details, undefined, {
        status: details.statusCode,
        xFrameOptions: named('x-frame-options'),
        csp: named('content-security-policy').includes('frame-ancestors')
          ? 'has frame-ancestors'
          : named('content-security-policy'),
        cspCount: headers.filter(
          (header) => header.name.toLowerCase() === 'content-security-policy',
        ).length,
      }).catch(console.error);
    },
    { urls: ['<all_urls>'], types: ['sub_frame'] },
    ['responseHeaders'],
  );

  chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId !== 0) {
      logFrameEvent('committed', details).catch(console.error);
    }
  });

  chrome.webNavigation.onErrorOccurred.addListener((details) => {
    if (details.frameId !== 0) {
      logFrameEvent('error', details, details.error).catch(console.error);
    }
  });
}

/**
 * Focuses the split view if one is open, reopens every saved one if none is,
 * and opens one otherwise.
 *
 * None open is what an extension update leaves: Chrome closes every tab of an
 * extension page when the extension is updated or reloaded. One click then
 * brings the whole list back, each in a tab of its own as `↗ Open all` does,
 * with the one used last in front. While any split view is open, the button
 * only goes back to one, so a split view closed on purpose stays closed.
 *
 * The page is opened with no `?ws=` at all when the list is empty, which is how
 * the button means "the one I had last": the workspace is then whichever the
 * saved list has as its active one. Naming a fixed id here would make the
 * button open the same split view for ever, whatever the user had been working
 * in.
 */
const openSplitView = async (): Promise<void> => {
  if (await focusExistingSplitView()) {
    return;
  }

  if (await reopenEverySplitView()) {
    return;
  }

  await chrome.tabs.create({
    url: chrome.runtime.getURL(splitViewPagePath),
  });
};

/**
 * Opens a pull request in a split view, in a new tab beside the one it was
 * asked from.
 *
 * The addresses were read off a web page, so they are checked again here:
 * nothing but a pull request on github.com is opened, and nothing but an issue
 * there is put beside it.
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
    pullRequest,
    title: message.title,
    issueUrl:
      message.issueUrl === undefined ? undefined : issueUrlOf(message.issueUrl),
  });

  await chrome.tabs.create({
    url: `${chrome.runtime.getURL(splitViewPagePath)}${search}`,
    active: message.active,
    ...(openerTab?.id === undefined
      ? {}
      : {
          openerTabId: openerTab.id,
          windowId: openerTab.windowId,
          index: openerTab.index + 1,
        }),
  });
};

/** What of the tab a pull request was asked from the new tab is put beside. */
type OpenerTab = Readonly<Pick<chrome.tabs.Tab, 'id' | 'index' | 'windowId'>>;

/**
 * The context menu's item was chosen on a pull request.
 *
 * The title and the issue are read by the GitHub content script, which is
 * asked to do so and answers with an `open`. A tab it is not in — a link to a
 * pull request on another site, or a GitHub tab loaded before the extension
 * was — refuses the message, and the pull request is opened with what the
 * address alone says.
 */
const openPullRequestFromMenu = async (
  url: string,
  tab: (OpenerTab & Readonly<{ url?: string }>) | undefined,
): Promise<void> => {
  if (pullRequestOf(url) === undefined) {
    return;
  }

  const lookUp: GitHubMessage = {
    tag: githubMessageTag,
    kind: 'look-up',
    url,
  } as const;

  if (tab?.id !== undefined && tab.url?.startsWith(gitHubOrigin) === true) {
    try {
      await chrome.tabs.sendMessage(tab.id, lookUp, { frameId: 0 });

      return;
    } catch {
      // No content script in that tab; open it with what is known.
    }
  }

  await openPullRequest(
    {
      tag: githubMessageTag,
      kind: 'open',
      url,
      title: undefined,
      issueUrl: undefined,
      active: true,
    },
    tab,
  );
};

/**
 * The context menu's two items: one on a link to a pull request, wherever the
 * link is, and one on a pull request's own page.
 *
 * Created on install and on update, which is when Chrome forgets them; they
 * are removed first because an update keeps them in some versions, and
 * creating an id twice is an error.
 */
const createContextMenus = async (): Promise<void> => {
  await chrome.contextMenus.removeAll();

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
};

const linkMenuItemId = 'open-pull-request-link';

const pageMenuItemId = 'open-pull-request-page';

/**
 * What Chrome shows the items for. Wider than a pull request — a match
 * pattern cannot say "digits" — and narrowed by `pullRequestOf` on the click.
 */
const pullRequestUrlPattern = 'https://github.com/*/*/pull/*';

const gitHubOrigin = 'https://github.com/';

/**
 * Opens every saved split view in a tab of its own, when none is open, and says
 * whether it did.
 *
 * The one to bring to the front is the list's active one, or the first when
 * the active one is not on the list: a click on the button has to end on a
 * split view, not on the tab it was clicked from.
 */
const reopenEverySplitView = async (): Promise<boolean> => {
  const registry = await loadWorkspaceRegistry();

  if (!Arr.isNonEmpty(registry.entries) || (await isAnyWorkspaceOpen())) {
    return false;
  }

  const frontId = registry.entries.some(
    (entry) => entry.id === registry.activeId,
  )
    ? registry.activeId
    : registry.entries[0].id;

  await openEveryWorkspaceInTabs(registry.entries, frontId);

  return true;
};

const focusExistingSplitView = async (): Promise<boolean> => {
  const stored = await chrome.storage.session.get(splitViewTabIdSessionKey);

  const tabId: unknown = stored[splitViewTabIdSessionKey];

  if (typeof tabId !== 'number') {
    return false;
  }

  try {
    const tab = await chrome.tabs.get(tabId);

    await chrome.tabs.update(tabId, { active: true });

    await chrome.windows.update(tab.windowId, { focused: true });

    return true;
  } catch {
    // The recorded tab has been closed, or was closed while the browser was
    // shut down. Opening a new one is the answer either way.
    return false;
  }
};

/**
 * Frame events are logged for the split view's tab only. Every page on the web
 * has frames, and a log of all of them would say nothing about this one.
 */
/**
 * The tail of the log-write chain. An object, because the lint rules allow a
 * `mut_`-prefixed property to be assigned but not a top-level binding.
 */
const mut_workerState: { appendQueue: Promise<void> } = {
  appendQueue: Promise.resolve(),
};

const logFrameEvent = async (
  kind: string,
  details: Readonly<{ tabId: number; frameId: number; url: string }>,
  error?: string,
  extra?: ReadonlyRecord<string, unknown>,
): Promise<void> => {
  const stored = await chrome.storage.session.get(splitViewTabIdSessionKey);

  if (stored[splitViewTabIdSessionKey] !== details.tabId) {
    return;
  }

  await appendEvent({
    kind,
    tabId: details.tabId,
    frameId: details.frameId,
    url: details.url,
    ...(error === undefined ? {} : { error }),
    ...(extra ?? {}),
  });
};

/**
 * Appends one event to the log, one at a time.
 *
 * The writes are serialized through a promise chain because the log lives in
 * session storage and a read-modify-write is exactly what it is: four frames
 * loading in the same millisecond had their entries overwrite each other, which
 * made the log look as though requests had never happened. A lost entry in a
 * diagnostic is worse than no diagnostic.
 */
const appendEvent = async (
  entry: ReadonlyRecord<string, unknown>,
): Promise<void> => {
  mut_workerState.appendQueue = mut_workerState.appendQueue.then(async () =>
    writeEvent(entry),
  );

  return mut_workerState.appendQueue;
};

const writeEvent = async (
  entry: ReadonlyRecord<string, unknown>,
): Promise<void> => {
  const stored = await chrome.storage.session.get(eventLogSessionKey);

  const previous: readonly unknown[] = Arr.isArray(stored[eventLogSessionKey])
    ? stored[eventLogSessionKey]
    : ([] as const);

  const clock = new Intl.DateTimeFormat('sv-SE', { timeStyle: 'medium' });

  const stamped = { at: clock.format(Date.now()), ...entry } as const;

  await chrome.storage.session.set({
    [eventLogSessionKey]: Arr.toPushed(previous, stamped).slice(
      -maxEventLogEntries,
    ),
  });
};

const moveHeaderRule = async (
  removedTabId: number,
  addedTabId: number,
): Promise<void> => {
  const rules = await chrome.declarativeNetRequest.getSessionRules();

  if (rules.every((rule) => rule.id !== headerRuleIdForTab(removedTabId))) {
    return;
  }

  await removeHeaderRule(removedTabId);

  await installHeaderRule(addedTabId);

  await moveOpenSplitViewTab(removedTabId, addedTabId);

  const stored = await chrome.storage.session.get(splitViewTabIdSessionKey);

  if (stored[splitViewTabIdSessionKey] === removedTabId) {
    await chrome.storage.session.set({
      [splitViewTabIdSessionKey]: addedTabId,
    });
  }
};

const forgetTab = async (tabId: number): Promise<void> => {
  const stored = await chrome.storage.session.get(splitViewTabIdSessionKey);

  if (stored[splitViewTabIdSessionKey] === tabId) {
    await chrome.storage.session.remove(splitViewTabIdSessionKey);
  }

  // The page cannot take itself off the list of open split views — the tab is
  // gone by the time it would — so this is where a closed one is forgotten.
  // "Open every split view" checks the browser as well, because a tab that
  // went while the worker was asleep is not announced to anybody.
  await forgetOpenSplitViewTab(tabId);

  await removeHeaderRule(tabId);
};
