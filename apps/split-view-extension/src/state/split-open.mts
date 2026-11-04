import type { ReadonlyRecord } from 'ts-type-forge';
import {
  formatLayoutSpec,
  paneNode,
  splitNode,
  type SplitAxis,
} from '../layout/index.mjs';
import { workerMessageTag, type SplitOpenRequest } from '../shared/index.mjs';
import {
  layoutQueryParam,
  paneUrlQueryParam,
  workspaceNameQueryParam,
} from './workspace-url.mjs';

/**
 * Whether the context menu was opened in a split view: on a tab whose page is
 * `splitViewPageUrl` (`chrome-extension://<id>/split.html`), with any query.
 * The menu is shown on web pages alone, so that is a click inside one of its
 * panes.
 */
export const isInSplitView = (
  pageUrl: string | undefined,
  splitViewPageUrl: string,
): boolean => pageUrl?.startsWith(splitViewPageUrl) === true;

/**
 * The query string of `split.html` that the context menu's "open to the right"
 * and "open below" items open from a tab that is not a split view: the tab's
 * page, and the link the menu was opened on — or an empty pane when it was
 * opened anywhere else — beside it or below it, half and half, named after the
 * tab's title.
 *
 * No `ws`, so each one is a split view of its own, added to the list as `＋`
 * adds one, rather than one saved split view that the next use would overwrite
 * while this one is still open in its tab.
 *
 * Only `http:` and `https:` addresses are put in a pane, and `undefined` — open
 * nothing — is the answer for anything else.
 */
export const splitOpenSearch = ({
  direction,
  pageUrl,
  linkUrl,
  tabTitle,
}: Readonly<{
  direction: SplitDirection;
  pageUrl: string | undefined;
  linkUrl: string | undefined;
  tabTitle: string | undefined;
}>): string | undefined => {
  const first = webPageUrlOf(pageUrl);

  const second = webPageUrlOf(linkUrl);

  // Nothing is opened when the tab's page is not a web page — the menu is
  // matched against the frame clicked in, so a web frame in a `file:` page has
  // it — or when the link is not to one.
  if (first === undefined || (linkUrl !== undefined && second === undefined)) {
    return undefined;
  }

  const params = [
    [
      layoutQueryParam,
      formatLayoutSpec(splitNode(axisOf(direction), paneNode(0), paneNode(1))),
    ],
    [paneUrlQueryParam, first],
    ...(second === undefined
      ? ([] as const)
      : ([[paneUrlQueryParam, second]] as const)),
    ...(tabTitle === undefined || tabTitle === ''
      ? ([] as const)
      : ([[workspaceNameQueryParam, tabTitle]] as const)),
  ] as const;

  const query = new URLSearchParams(params);

  // Percent-encoded whole, `:` and `/` too, as `pullRequestSplitViewSearch`
  // writes it: the page writes the readable form back into its address bar once
  // it has loaded.
  return `?${query.toString()}`;
};

/**
 * What the worker asks the split view in `tabId` to do when the menu was opened
 * in one of its panes: split that pane — `paneId`, which the pane's frame said
 * it was, or the active pane when it could not — as its `||` and `=` buttons
 * do, and open the link in the new pane, or leave it empty.
 */
export const splitOpenRequest = ({
  direction,
  tabId,
  paneId,
  linkUrl,
}: Readonly<{
  direction: SplitDirection;
  tabId: number;
  paneId: number | undefined;
  linkUrl: string | undefined;
}>): SplitOpenRequest | undefined => {
  const url = webPageUrlOf(linkUrl);

  // As in `splitOpenSearch`: a link that is not to a web page opens nothing.
  return linkUrl !== undefined && url === undefined
    ? undefined
    : ({
        tag: workerMessageTag,
        kind: 'split-open',
        tabId,
        paneId,
        axis: axisOf(direction),
        url,
      } as const);
};

/**
 * The menu's item titles, in Japanese when Chrome's UI is and in English
 * otherwise. The manifest has no `_locales`, so `chrome.i18n.getMessage` has
 * nothing to look up; the UI language is read instead.
 */
export const splitOpenMenuTitle = (
  direction: SplitDirection,
  uiLanguage: string,
): string =>
  menuTitles[uiLanguage.toLowerCase().startsWith('ja') ? 'ja' : 'en'][
    direction
  ];

/**
 * Which way the context menu's "open in a split" items put the second page:
 * beside the first, or below it.
 */
export type SplitDirection = 'right' | 'down';

const menuTitles = {
  en: {
    right: 'Open in a split to the right',
    down: 'Open in a split below',
  },
  ja: {
    right: '右に分割して開く',
    down: '下に分割して開く',
  },
} as const satisfies ReadonlyRecord<
  'en' | 'ja',
  ReadonlyRecord<SplitDirection, string>
>;

/** "To the right" is the `||` button's split, a row; "below" is `=`'s. */
const axisOf = (direction: SplitDirection): SplitAxis =>
  direction === 'right' ? 'row' : 'column';

/**
 * `new URL` in a `try` rather than `URL.canParse`, which Chrome has only from
 * 120 while the manifest allows 116.
 */
const webPageUrlOf = (address: string | undefined): string | undefined => {
  if (address === undefined) {
    return undefined;
  }

  try {
    const { protocol } = new URL(address);

    return protocol === 'http:' || protocol === 'https:' ? address : undefined;
  } catch {
    return undefined;
  }
};
