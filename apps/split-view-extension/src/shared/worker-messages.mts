import { hasKey, isRecord, Num, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { paneFrameNamePrefix } from './protocol.mjs';

export const asPaneOfFrameQuery = (
  value: unknown,
): PaneOfFrameQuery | undefined =>
  isWorkerMessage(value) && value.kind === 'pane-of-frame'
    ? ({ tag: workerMessageTag, kind: 'pane-of-frame' } as const)
    : undefined;

/** The frame agent's answer to a `PaneOfFrameQuery`, as a pane id. */
export const paneIdOfAnswer = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? value
    : undefined;

/**
 * The pane a frame's `name` says it is — the page names each pane's frame
 * `split-view-pane:<id>`, and the name survives the frame's navigations — for a
 * pane's frame that the page has not yet told which pane it is: one whose new
 * document has not finished loading.
 */
export const paneIdOfFrameName = (frameName: string): number | undefined => {
  if (!frameName.startsWith(paneFrameNamePrefix)) {
    return undefined;
  }

  const digits = frameName.slice(paneFrameNamePrefix.length);

  return /^\d{1,9}$/u.test(digits)
    ? Result.unwrapOkOr(Num.safeParseInt(digits), undefined)
    : undefined;
};

export const asSplitOpenRequest = (
  value: unknown,
): SplitOpenRequest | undefined => {
  if (
    !isWorkerMessage(value) ||
    value.kind !== 'split-open' ||
    !hasKey(value, 'tabId') ||
    typeof value.tabId !== 'number' ||
    !hasKey(value, 'axis') ||
    (value.axis !== 'row' && value.axis !== 'column')
  ) {
    return undefined;
  }

  const paneId = hasKey(value, 'paneId')
    ? paneIdOfAnswer(value.paneId)
    : undefined;

  const url =
    hasKey(value, 'url') && typeof value.url === 'string'
      ? value.url
      : undefined;

  return {
    tag: workerMessageTag,
    kind: 'split-open',
    tabId: value.tabId,
    paneId,
    axis: value.axis,
    url,
  };
};

/**
 * Tags every message between the service worker and the split view's own pages
 * and content scripts over `chrome.runtime`, so that they are not taken for the
 * GitHub messages that share the channel.
 */
export const workerMessageTag = 'split-view/worker/v1';

/**
 * Sent by the worker to one frame of a split view, the one a context menu was
 * opened in, to ask which pane it is. The frame agent answers with the pane's
 * id, or `null` when it was not assigned one — a frame nested inside a pane's
 * page.
 */
export type PaneOfFrameQuery = Readonly<{
  tag: typeof workerMessageTag;
  kind: 'pane-of-frame';
}>;

/**
 * Sent by the worker to the split view pages, for the one in `tabId`: split
 * `paneId` — or the active pane when the frame could not say which it was in —
 * as the pane's split buttons do, and open `url` in the new pane, or leave it
 * empty.
 *
 * Over `chrome.runtime`, which reaches every page of the extension, because
 * `chrome.tabs.sendMessage` reaches content scripts only; each page compares
 * `tabId` with its own.
 */
export type SplitOpenRequest = Readonly<{
  tag: typeof workerMessageTag;
  kind: 'split-open';
  tabId: number;
  paneId: number | undefined;
  axis: 'column' | 'row';
  url: string | undefined;
}>;

const isWorkerMessage = (
  value: unknown,
): value is ReadonlyRecord<string, unknown> & Readonly<{ kind: unknown }> =>
  isRecord(value) &&
  hasKey(value, 'tag') &&
  value.tag === workerMessageTag &&
  hasKey(value, 'kind');
