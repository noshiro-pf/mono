import {
  layoutQueryParam,
  paneUrlQueryParam,
  workspaceNameQueryParam,
} from 'split-view-link';
import { webPageUrlOf } from './address.mjs';
import {
  formatLayoutSpec,
  paneLeaf,
  split,
  type SplitAxis,
} from './layout/index.mjs';
import { workerTag, type SplitOpenRequest } from './protocol.mjs';

/** Which way "open in a split" puts the second page (spec M2). */
export type SplitDirection = 'down' | 'right';

export const splitMenuItems = [
  { id: 'open-in-split-right', direction: 'right' },
  { id: 'open-in-split-down', direction: 'down' },
] as const satisfies readonly Readonly<{
  id: string;
  direction: SplitDirection;
}>[];

/** The items' titles: Japanese when Chrome's UI is, English otherwise. */
export const splitMenuTitle = (
  direction: SplitDirection,
  uiLanguage: string,
): string =>
  uiLanguage.toLowerCase().startsWith('ja')
    ? direction === 'right'
      ? '右に分割して開く'
      : '下に分割して開く'
    : direction === 'right'
      ? 'Open in a split to the right'
      : 'Open in a split below';

export const axisOfDirection = (direction: SplitDirection): SplitAxis =>
  direction === 'right' ? 'row' : 'column';

/** Whether a page is this extension's split view. */
export const isSplitViewPage = (
  pageUrl: string | undefined,
  splitViewPageUrl: string,
): boolean => pageUrl?.startsWith(splitViewPageUrl) === true;

/**
 * The `split.html` query for a split opened from an ordinary tab: its page and
 * the link — or an empty pane when the menu was not on a link — half and half,
 * named after the tab. No `ws`, so each is a split view of its own. `undefined`
 * when the page or the link is not a web page: nothing opens.
 */
export const splitOpenQuery = ({
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

  if (first === undefined || (linkUrl !== undefined && second === undefined)) {
    return undefined;
  }

  const query = new URLSearchParams([
    [
      layoutQueryParam,
      formatLayoutSpec(
        split(axisOfDirection(direction), paneLeaf(0), paneLeaf(1)),
      ),
    ],
    [paneUrlQueryParam, first],
    ...(second === undefined ? [] : [[paneUrlQueryParam, second] as const]),
    ...(tabTitle === undefined || tabTitle === ''
      ? []
      : [[workspaceNameQueryParam, tabTitle] as const]),
  ]);

  return `?${query.toString()}`;
};

/**
 * What the worker asks a split view to do when the menu was opened in one of
 * its panes. `undefined` when the link is not to a web page.
 */
export const splitOpenRequestOf = ({
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

  return linkUrl !== undefined && url === undefined
    ? undefined
    : {
        tag: workerTag,
        kind: 'split-open',
        tabId,
        paneId,
        axis: axisOfDirection(direction),
        url,
      };
};
