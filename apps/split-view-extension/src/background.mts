import { splitViewPagePath } from 'split-view-link';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  ensureInitiatorRule,
  eventLogSessionKey,
  forgetOpenSplitViewTab,
  headerRuleIdForTab,
  installHeaderRule,
  maxEventLogEntries,
  moveOpenSplitViewTab,
  paneIdOfAnswer,
  removeHeaderRule,
  splitViewTabIdSessionKey,
  workerMessageTag,
  type PaneOfFrameQuery,
} from './shared/index.mjs';
import {
  isAnyWorkspaceOpen,
  isInSplitView,
  loadWorkspaceRegistry,
  openEveryWorkspaceInTabs,
  splitOpenMenuTitle,
  splitOpenRequest,
  splitOpenSearch,
  type SplitDirection,
} from './state/index.mjs';

/**
 * The service worker.
 *
 * The split view manages its own header-stripping rule from the page, because
 * the page is what knows which tab it is in; the worker is here for the events
 * a page cannot see — the toolbar button being clicked, its own tab being
 * closed, and a page or a link asked to be opened in a split from the context
 * menu — which, in a split view, is passed on to the page.
 *
 * A pull request on GitHub is opened in a split view by
 * `github-view-defaults-extension`, which opens `split.html` itself; nothing
 * here knows GitHub, so that following GitHub's markup never needs an update of
 * this extension, which would close every split view open.
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

  createContextMenus().catch(console.error);
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const direction = splitDirectionOfMenuItem(info.menuItemId);

  if (direction !== undefined) {
    openInSplit(direction, info, tab).catch(console.error);
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
  // A debugging API the browser does not offer throws here. Uncaught, that
  // would stop the worker's module halfway through its first run: the listeners
  // above would stay registered, but every function they call is declared
  // further down and would never be assigned, so the toolbar button
  // would fail with "<name> is not a function". The diagnostics are an extra;
  // losing them must not take the worker with them.
  try {
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
  } catch (error) {
    console.error('Split View: the diagnostics could not be started.', error);
  }
}

/**
 * Opens every saved split view in a tab of its own, when none is open, and says
 * whether it did.
 *
 * The one to bring to the front is the list's active one, or the first when the
 * active one is not on the list: a click on the button has to end on a split
 * view, not on the tab it was clicked from.
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
 * Asks the frame the menu was opened in which pane it is, and the split view in
 * that tab to split it.
 *
 * Only the pane's own frame knows: it was told by the page, and is named after
 * the pane. A frame nested inside a pane's page is neither, and answers `null`;
 * the split view then splits its active pane — the one whose toolbar was last
 * used, or that was last split or navigated.
 */
const splitPaneInSplitView = async (
  direction: SplitDirection,
  info: Readonly<Pick<chrome.contextMenus.OnClickData, 'frameId' | 'linkUrl'>>,
  tabId: number,
): Promise<void> => {
  const query: PaneOfFrameQuery = {
    tag: workerMessageTag,
    kind: 'pane-of-frame',
  } as const;

  const answer: unknown =
    info.frameId === undefined
      ? undefined
      : await chrome.tabs
          .sendMessage(tabId, query, { frameId: info.frameId })
          .catch(() => undefined);

  const request = splitOpenRequest({
    direction,
    tabId,
    paneId: paneIdOfAnswer(answer),
    linkUrl: info.linkUrl,
  });

  if (request === undefined) {
    return;
  }

  // No page answers — the one in `tabId` acts and the rest ignore it — so the
  // promise settles with "the message port closed", which is not a failure.
  await chrome.runtime.sendMessage(request).catch(() => undefined);
};

/**
 * The context menu's "open to the right" and "open below" items were chosen.
 *
 * In a split view, the pane the menu was opened in is split as its `||` and `=`
 * buttons split it, and the link opens in the new pane. Anywhere else, a new
 * split view opens in a tab where this one was — the page beside the link — and
 * this tab is closed, so that the split view takes its place; it is in
 * Chrome's recently closed list like any other.
 *
 * Nothing is opened from an incognito tab. The extension runs in spanning mode,
 * so its page would open in a normal window, and the incognito page's address
 * and title would be saved in the list of split views for good.
 */
const openInSplit = async (
  direction: SplitDirection,
  info: Readonly<
    Pick<chrome.contextMenus.OnClickData, 'frameId' | 'linkUrl' | 'pageUrl'>
  >,
  tab:
    | Readonly<
        Pick<
          chrome.tabs.Tab,
          'id' | 'index' | 'windowId' | 'title' | 'incognito' | 'pinned'
        >
      >
    | undefined,
): Promise<void> => {
  // A tab Chrome does not name cannot be told to be a normal one either.
  if (tab?.id === undefined || tab.incognito) {
    return;
  }

  if (isInSplitView(info.pageUrl, chrome.runtime.getURL(splitViewPagePath))) {
    await splitPaneInSplitView(direction, info, tab.id);

    return;
  }

  const search = splitOpenSearch({
    direction,
    pageUrl: info.pageUrl,
    linkUrl: info.linkUrl,
    tabTitle: tab.title,
  });

  if (search === undefined) {
    return;
  }

  // Created before the tab is closed, so that a failure to open leaves the user
  // where they were.
  await chrome.tabs.create({
    url: `${chrome.runtime.getURL(splitViewPagePath)}${search}`,
    openerTabId: tab.id,
    windowId: tab.windowId,
    index: tab.index + 1,
  });

  // A pinned tab is kept: the split view cannot take its place in the pinned
  // strip, and closing it would take it out.
  if (!tab.pinned) {
    await chrome.tabs.remove(tab.id);
  }
};

const splitDirectionOfMenuItem = (
  menuItemId: string | number,
): SplitDirection | undefined =>
  splitMenuItems.find((item) => item.id === menuItemId)?.direction;

const replaceContextMenus = async (): Promise<void> => {
  await chrome.contextMenus.removeAll();

  const uiLanguage = chrome.i18n.getUILanguage();

  for (const item of splitMenuItems) {
    chrome.contextMenus.create({
      id: item.id,
      title: splitOpenMenuTitle(item.direction, uiLanguage),
      // On a link the link goes in the new pane; anywhere else on the page the
      // new pane is empty. Chrome counts a click as `page` only when it is on
      // nothing more particular. A selection and a text field are left out:
      // outside a split view the tab is closed, with what was typed in it, and
      // a selection may be in a text field. Images and media are left out too,
      // because `targetUrlPatterns` would be matched against their `src`, and a
      // `data:` image would hide the items.
      contexts: ['link', 'page'],
      // Web pages only: a `chrome://` page cannot be put in a pane, and on the
      // split view's own page — its top bar, a pane's toolbar — there is no
      // page to split. Chrome matches this against the frame the menu was
      // opened in, so it is shown inside a split view's panes too.
      documentUrlPatterns: Array.from(webPageUrlPatterns),
      targetUrlPatterns: Array.from(webPageUrlPatterns),
    });
  }
};

/**
 * The context menu's items: "open to the right" and "open below" on any web
 * page and any link on one.
 *
 * Created on install and on update, which is when Chrome forgets them, and on
 * startup, so that the titles follow a change of Chrome's language; they are
 * removed first because an update keeps them in some versions, and creating an
 * id twice is an error. The runs are queued one after another, because an
 * update applied at startup fires both events, and two runs interleaved would
 * create every id twice.
 */
const createContextMenus = async (): Promise<void> => {
  // A run that failed has logged its error; the next one starts regardless.
  mut_workerState.menuQueue = mut_workerState.menuQueue
    .catch(() => undefined)
    .then(replaceContextMenus);

  return mut_workerState.menuQueue;
};

const splitMenuItems = [
  { id: 'open-in-split-right', direction: 'right' },
  { id: 'open-in-split-down', direction: 'down' },
] as const;

const webPageUrlPatterns = ['http://*/*', 'https://*/*'] as const;

/**
 * The tails of the log-write chain and of the context menu's re-creation. An
 * object, because the lint rules allow a `mut_`-prefixed property to be
 * assigned but not a top-level binding.
 */
const mut_workerState: {
  appendQueue: Promise<void>;
  menuQueue: Promise<void>;
} = {
  appendQueue: Promise.resolve(),
  menuQueue: Promise.resolve(),
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

/**
 * Frame events are logged for the split view's tab only. Every page on the web
 * has frames, and a log of all of them would say nothing about this one.
 */
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
  // "Open every split view" checks the browser as well, because a tab that went
  // while the worker was asleep is not announced to anybody.
  await forgetOpenSplitViewTab(tabId);

  await removeHeaderRule(tabId);
};
