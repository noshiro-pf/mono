import { castDeepMutable, castMutable, unknownToString } from 'ts-data-forge';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';

/**
 * The rules that let a pane frame a site that refuses to be framed (spec F1).
 *
 * Both remove `X-Frame-Options` and the two CSP headers, and make the request
 * look like a top-level navigation by its Fetch Metadata, for `sub_frame`
 * requests only. `declarativeNetRequest` cannot edit a header's value, so the
 * whole CSP goes: a pane loses the site's own XSS protection with it, which is
 * the cost of framing a site that does not want to be. The tab rule reaches
 * every frame in the tab, a pane page's own nested frames included, since a
 * rule cannot tell those from a pane's next document.
 *
 * The dynamic rule is scoped to this extension as initiator, so it covers every
 * frame a split view page opens in any tab, and outlives a tab id that the
 * memory saver replaces. A link clicked inside a pane is initiated by the site,
 * which only the session rule for the tab sees.
 */
export const initiatorRuleId = 1;

/** A tab's session rule id: rule ids are positive, tab ids are unique. */
export const tabRuleIdOf = (tabId: number): number => Math.max(1, tabId);

/** Installs the dynamic rule unless it is there; whether it is afterwards. */
export const ensureInitiatorRule = async (): Promise<boolean> => {
  if (await hasInitiatorRule()) {
    return true;
  }

  await installInitiatorRule();

  return hasInitiatorRule();
};

/**
 * Writes the dynamic rule as this version defines it, replacing whatever is
 * there: dynamic rules outlive an update, so a rule an earlier version wrote
 * stays as it was until replaced. Run when the extension is installed or
 * updated; `ensureInitiatorRule` is what the page runs.
 */
export const installInitiatorRule = async (): Promise<void> => {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [initiatorRuleId],
    addRules: [
      ruleOf(initiatorRuleId, {
        initiatorDomains: [chrome.runtime.id],
        resourceTypes: ['sub_frame'],
      }),
    ],
  });
};

/**
 * Installs a tab's session rule unless it is there; whether it is afterwards.
 * Asserted again rather than installed once (spec F2): a discarded tab comes
 * back under a new id, and a rule for the old one matches nothing.
 */
export const ensureTabRule = async (tabId: number): Promise<boolean> => {
  if (await hasTabRule(tabId)) {
    return true;
  }

  await installTabRule(tabId);

  return hasTabRule(tabId);
};

export const hasTabRule = async (tabId: number): Promise<boolean> => {
  const rules = await chrome.declarativeNetRequest.getSessionRules();

  return rules.some((rule) => rule.id === tabRuleIdOf(tabId));
};

export const removeTabRule = async (tabId: number): Promise<void> => {
  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [tabRuleIdOf(tabId)],
  });
};

/** Moves a tab's rule to the id Chrome gave the tab; nothing if it had none. */
export const moveTabRule = async (
  fromTabId: number,
  toTabId: number,
): Promise<void> => {
  if (!(await hasTabRule(fromTabId))) {
    return;
  }

  await removeTabRule(fromTabId);

  await installTabRule(toTabId);
};

/**
 * Whether the extension may act on every site. Chrome's per-extension site
 * access, or a `runtime_blocked_hosts` policy, can withhold it, and a rule the
 * extension may not apply is a rule that is installed and never matches.
 */
export const hasHostAccess = async (): Promise<boolean> =>
  chrome.permissions.contains({ origins: ['<all_urls>'] });

/** Asks for site access back; must run in a click's handler. */
export const requestHostAccess = async (): Promise<boolean> =>
  chrome.permissions.request({ origins: ['<all_urls>'] });

/**
 * The diagnostics dump of a development build (spec D1, D5): host access, the
 * rules, which of them matched in this tab, and the framing headers each pane's
 * address really answers with — a `fetch` is not a `sub_frame` request, so the
 * rules leave it alone.
 */
export const readDiagnostics = async (
  tabId: number | undefined,
  paneUrls: readonly string[],
): Promise<string> => {
  const [hostAccess, dynamicRules, sessionRules, matched, responses] =
    await Promise.all([
      hasHostAccess(),
      chrome.declarativeNetRequest.getDynamicRules(),
      chrome.declarativeNetRequest.getSessionRules(),
      SPLIT_VIEW_DIAGNOSTICS
        ? chrome.declarativeNetRequest
            .getMatchedRules(tabId === undefined ? {} : { tabId })
            .then((result) => result.rulesMatchedInfo)
            .catch((error: unknown) => `unavailable: ${unknownToString(error)}`)
        : Promise.resolve('not a development build'),
      Promise.all(paneUrls.map(probeFramingHeaders)),
    ]);

  return JSON.stringify(
    {
      build: SPLIT_VIEW_BUILD_ID,
      userAgent: globalThis.navigator.userAgent,
      extensionId: chrome.runtime.id,
      hostAccess,
      tabId: tabId ?? null,
      expectedTabRuleId: tabId === undefined ? null : tabRuleIdOf(tabId),
      dynamicRules: dynamicRules.map(({ id, condition }) => ({
        id,
        condition,
      })),
      sessionRules: sessionRules.map(({ id, condition }) => ({
        id,
        condition,
      })),
      matched,
      responses,
    },
    undefined,
    1,
  );
};

const strippedResponseHeaders = [
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
] as const;

/**
 * Some sites refuse in the server by reading Fetch Metadata: Google Translate
 * answers `Sec-Fetch-Dest: iframe` with an empty 403. The request is made to
 * say what it would if the address were typed into a tab.
 */
const requestHeaderValues = [
  ['sec-fetch-dest', 'document'],
  ['sec-fetch-mode', 'navigate'],
  ['sec-fetch-site', 'none'],
] as const;

const ruleOf = (
  id: number,
  condition: DeepReadonly<chrome.declarativeNetRequest.RuleCondition>,
): chrome.declarativeNetRequest.Rule =>
  ({
    id,
    priority: 1,
    action: {
      type: 'modifyHeaders',
      requestHeaders: castMutable(
        requestHeaderValues.map(([header, value]) => ({
          header,
          operation: 'set',
          value,
        })),
      ),
      responseHeaders: castMutable(
        strippedResponseHeaders.map((header) => ({
          header,
          operation: 'remove',
        })),
      ),
    },
    condition: castDeepMutable(condition),
  }) as const;

const installTabRule = async (tabId: number): Promise<void> => {
  const id = tabRuleIdOf(tabId);

  await chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [id],
    addRules: [ruleOf(id, { tabIds: [tabId], resourceTypes: ['sub_frame'] })],
  });
};

const probeFramingHeaders = async (
  url: string,
): Promise<ReadonlyRecord<string, unknown>> => {
  try {
    const response = await fetch(url, { credentials: 'include' });

    const csp = response.headers.get('content-security-policy') ?? '';

    return {
      url,
      status: response.status,
      finalUrl: response.url === url ? '(same)' : response.url,
      xFrameOptions: response.headers.get('x-frame-options'),
      frameAncestors: /frame-ancestors[^;]*/u.exec(csp)?.[0] ?? null,
      cspReportOnly: response.headers.has(
        'content-security-policy-report-only',
      ),
      vary: response.headers.get('vary'),
    };
  } catch (error: unknown) {
    return { url, fetchFailed: unknownToString(error) };
  }
};

const hasInitiatorRule = async (): Promise<boolean> => {
  const rules = await chrome.declarativeNetRequest.getDynamicRules();

  return rules.some((rule) => rule.id === initiatorRuleId);
};
