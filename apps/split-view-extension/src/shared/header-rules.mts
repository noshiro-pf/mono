import { castMutable } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { eventLogSessionKey } from './constants.mjs';

// Neither `window.navigator`, `globalThis.navigator` nor a bare `navigator`
// satisfies the lint rules together; destructuring once names it something that
// is none of those. The same dance as `browserHistory` in `frame-agent.mts`.
const { navigator: browserNavigator } = globalThis;

/**
 * The response headers that stop a page from being framed, and the session rule
 * that removes them.
 *
 * This is what makes "any web page" possible: without it every site that sends
 * `X-Frame-Options` or a `frame-ancestors` directive — which is most of the
 * interesting ones — shows an empty pane.
 *
 * Two things keep the blast radius small.
 *
 * - The rule's condition names the split view's own tab and `sub_frame` only,
 *   so nothing changes for ordinary browsing, and nothing changes for the
 *   top-level document of any tab. Clickjacking protection is intact
 *   everywhere except inside a pane the user opened deliberately.
 * - The rule is session-scoped, so it disappears when the browser closes, and
 *   `tabIds` is only available on session rules anyway.
 *
 * The whole CSP header is removed rather than just its `frame-ancestors`
 * directive, because `declarativeNetRequest` cannot read a header's value —
 * `remove`, `set` and `append` are all it has, and appending cannot loosen a
 * CSP. So a pane also loses the site's own XSS protections. That is the cost of
 * framing a site that does not want to be framed; it applies to the pane only.
 */
const strippedResponseHeaders: readonly string[] = [
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
] as const;

/**
 * The id of the rule that is scoped to this extension as the initiator rather
 * than to a tab. Dynamic rules survive a browser restart and an extension
 * update, so this one is there before any page of ours is.
 */
export const initiatorRuleId = 1;

/**
 * The rule that covers every frame **this extension opens**, in any tab.
 *
 * `initiatorDomains` takes hostnames, and the host part of a
 * `chrome-extension://` URL is the extension id — so the extension's own id
 * scopes the rule to requests our pages start. Measured: a pane's frame gets
 * the headers stripped, while an `iframe` in an ordinary page stays blocked as
 * it should.
 *
 * This is what the tab-scoped rule below cannot be: independent of a tab id.
 * Chrome's memory saver gives a discarded tab a **new** id when it comes back,
 * and a request can reach the network with no tab attributed to it at all;
 * either leaves a tab-scoped rule matching nothing.
 */
export const ensureInitiatorRule = async (): Promise<boolean> => {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();

  if (existing.some((rule) => rule.id === initiatorRuleId)) {
    return true;
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [initiatorRuleId],
    addRules: [
      {
        id: initiatorRuleId,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: castMutable(framingHeaderActions()),
        },
        condition: {
          initiatorDomains: [chrome.runtime.id],
          resourceTypes: ['sub_frame'],
        },
      },
    ],
  });

  const installed = await chrome.declarativeNetRequest.getDynamicRules();

  return installed.some((rule) => rule.id === initiatorRuleId);
};

/** The header edits both rules apply. */
const framingHeaderActions = (): readonly Readonly<{
  header: string;
  operation: 'remove';
}>[] =>
  strippedResponseHeaders.map(
    (header) => ({ header, operation: 'remove' }) as const,
  );

/**
 * The rule id used for a tab. Rule ids have to be positive, and a tab id is
 * unique for the life of the session, which is also the life of the rule.
 */
export const headerRuleIdForTab = (tabId: number): number => Math.max(1, tabId);

/** Installs (or replaces) the header-stripping rule for one tab. */
export const installHeaderRule = async (tabId: number): Promise<void> => {
  const id = headerRuleIdForTab(tabId);

  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [id],
    addRules: [
      {
        id,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          responseHeaders: castMutable(framingHeaderActions()),
        },
        condition: {
          tabIds: [tabId],
          resourceTypes: ['sub_frame'],
        },
      },
    ],
  });
};

/**
 * Installs the rule if the tab does not have one, and reports whether it is
 * there afterwards.
 *
 * The rule is bound to a tab id, and a tab id is not as permanent as it looks:
 * Chrome's memory saver discards an idle tab and gives it a **new** id when it
 * comes back, which leaves the old rule matching nothing. A pane that was
 * already loaded keeps its content, so the failure only shows up on the next
 * navigation — as a page that refuses to be framed suddenly refusing again.
 *
 * So the rule is re-asserted rather than installed once: before every
 * navigation, and whenever the tab becomes visible again.
 *
 * The tab-scoped rule is still needed alongside `ensureInitiatorRule`, because
 * a link clicked *inside* a pane is initiated by the site, not by us — the
 * initiator-scoped rule does not see it, and the tab-scoped one does.
 */
export const ensureHeaderRule = async (tabId: number): Promise<boolean> => {
  const id = headerRuleIdForTab(tabId);

  const existing = await chrome.declarativeNetRequest.getSessionRules();

  if (existing.some((rule) => rule.id === id)) {
    return true;
  }

  await installHeaderRule(tabId);

  const installed = await chrome.declarativeNetRequest.getSessionRules();

  return installed.some((rule) => rule.id === id);
};

/**
 * What the rules currently look like, for the diagnostics panel.
 *
 * `getMatchedRules` needs the `declarativeNetRequestFeedback` permission and
 * answers the only question that matters when a pane will not load: did a rule
 * act on that request, or not?
 */
/**
 * What a URL actually answers with, fetched from the extension page.
 *
 * A `fetch` is not a `sub_frame` request, so the rules leave it alone and what
 * comes back is what the server really sent — which is the only way to see the
 * headers of a response that is being served to *this* browser, signed in as
 * this user, rather than the ones a logged-out request gets.
 */
const probeFramingHeaders = async (
  url: string,
): Promise<ReadonlyRecord<string, unknown>> => {
  try {
    const response = await fetch(url, {
      credentials: 'include',
    });

    const csp = response.headers.get('content-security-policy') ?? '';

    return {
      url,
      status: response.status,
      redirected: response.redirected,
      finalUrl: response.url === url ? '(same)' : response.url,
      xFrameOptions: response.headers.get('x-frame-options'),
      frameAncestors: csp.includes('frame-ancestors')
        ? (/frame-ancestors[^;]*/u.exec(csp)?.[0] ?? '(present)')
        : null,
      cspLength: csp.length,
      cspReportOnly: response.headers.get('content-security-policy-report-only')
        ?.length,
      crossOriginResourcePolicy: response.headers.get(
        'cross-origin-resource-policy',
      ),
      crossOriginEmbedderPolicy: response.headers.get(
        'cross-origin-embedder-policy',
      ),
      cacheControl: response.headers.get('cache-control'),
      vary: response.headers.get('vary'),
    };
  } catch (error: unknown) {
    return { url, fetchFailed: String(error) };
  }
};

export const readRuleDiagnostics = async (
  tabId: number | undefined,
  paneUrls: readonly string[] = [],
): Promise<string> => {
  // Whether the extension may act on a host at all. Chrome's per-extension
  // "site access" setting, and an enterprise `runtime_blocked_hosts` policy,
  // both withhold this — and a rule the extension may not apply to a host is
  // exactly a rule that is installed and never matches.
  const hostAccess = {
    allUrls: await chrome.permissions.contains({ origins: ['<all_urls>'] }),
    github: await chrome.permissions.contains({
      origins: ['https://github.com/*'],
    }),
  } as const;

  const log = await chrome.storage.session.get(eventLogSessionKey);

  const responses = await Promise.all(paneUrls.map(probeFramingHeaders));

  const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();

  const sessionRules = await chrome.declarativeNetRequest.getSessionRules();

  const matched = SPLIT_VIEW_DIAGNOSTICS
    ? await chrome.declarativeNetRequest
        .getMatchedRules(tabId === undefined ? {} : { tabId })
        .then((result) => result.rulesMatchedInfo)
        .catch((error: unknown) => `unavailable: ${String(error)}`)
    : 'not a development build';

  return JSON.stringify(
    {
      build: SPLIT_VIEW_BUILD_ID,
      userAgent: browserNavigator.userAgent,
      extensionId: chrome.runtime.id,
      hostAccess,
      tabId: tabId ?? null,
      expectedTabRuleId: tabId === undefined ? null : headerRuleIdForTab(tabId),
      dynamicRules: dynamicRules.map((rule) => ({
        id: rule.id,
        condition: rule.condition,
      })),
      sessionRules: sessionRules.map((rule) => ({
        id: rule.id,
        condition: rule.condition,
      })),
      matched,
      events: log[eventLogSessionKey] ?? [],
      responses,
    },
    undefined,
    1,
  );
};

/** Removes the rule for a tab, once that tab is gone. */
export const removeHeaderRule = async (tabId: number): Promise<void> => {
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [headerRuleIdForTab(tabId)],
  });
};
