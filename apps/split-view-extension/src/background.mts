import { Arr } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import {
  ensureInitiatorRule,
  eventLogSessionKey,
  headerRuleIdForTab,
  installHeaderRule,
  maxEventLogEntries,
  removeHeaderRule,
  splitViewPagePath,
  splitViewTabIdSessionKey,
} from './shared/index.mjs';

/**
 * The service worker, which does two things and no more.
 *
 * The split view manages its own header-stripping rule from the page, because
 * the page is what knows which tab it is in; the worker is here for the two
 * events a page cannot see — the toolbar button being clicked, and its own tab
 * being closed.
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

  if (details.reason === 'install') {
    openSplitView().catch(console.error);
  }
});

chrome.runtime.onStartup.addListener(() => {
  ensureInitiatorRule().catch(console.error);
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
   * than arguable. It can be dropped once the cause is known — see the README.
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
 * Focuses the split view if one is open, and opens one otherwise.
 *
 * The page is opened with no `?ws=` at all, which is how the button means "the
 * one I had last": the workspace is then whichever the saved list has as its
 * active one. Naming a fixed id here would make the button open the same split
 * view for ever, whatever the user had been working in.
 */
const openSplitView = async (): Promise<void> => {
  if (await focusExistingSplitView()) {
    return;
  }

  await chrome.tabs.create({
    url: chrome.runtime.getURL(splitViewPagePath),
  });
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

  await removeHeaderRule(tabId);
};
