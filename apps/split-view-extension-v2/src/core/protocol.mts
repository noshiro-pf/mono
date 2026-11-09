import { Arr, hasKey, isRecord, Num, Result } from 'ts-data-forge';
import type { UnknownRecord } from 'ts-type-forge';
import { paneAddressOf } from './address.mjs';
import { parseList, parseOrigins } from './codecs.mjs';
import { asPaneId, nonEmpty, numberField, stringField } from './fields.mjs';
import type { SplitAxis } from './layout/index.mjs';
import type { ListAnswer, ListOp } from './list-ops.mjs';
import type { SplitViewList } from './list.mjs';

/**
 * The messages between the parts of the extension (spec A6). Every one is
 * tagged, and validated field by field on arrival: a frame's message comes from
 * an arbitrary web page.
 */

/** `postMessage` between the page and the frames. */
export const frameTag = 'split-view/v1';

/** `chrome.runtime` messages between the worker, the page and the content scripts. */
export const workerTag = 'split-view/worker/v1';

/** `chrome.runtime` messages between the GitHub button and the worker. */
export const githubTag = 'split-view/github/v1';

/** Between a page and the service worker, about the saved list (spec W10). */
export const listTag = 'split-view/list/v1';

/**
 * The `name` of a pane's `iframe`, `split-view-pane:<id>`. A frame keeps its
 * name from one document to the next, so a document not yet told its pane can
 * read it.
 */
export const paneFrameNamePrefix = 'split-view-pane:';

export type FrameCommand = 'back' | 'forward' | 'reload';

/** A key a pane takes from the browser (spec A3). */
export type PaneKey = Readonly<
  { kind: 'reload' } | { kind: 'workspace'; code: string }
>;

export type PageToFrame = Readonly<
  | { tag: typeof frameTag; kind: 'assign'; paneId: number }
  | {
      tag: typeof frameTag;
      kind: 'command';
      paneId: number;
      command: FrameCommand;
    }
  | { tag: typeof frameTag; kind: 'unregister-service-workers'; paneId: number }
>;

export type FrameToPage =
  // A pane's document, as soon as it has one, asking to be assigned: the
  // frame's `load` can come long after the page shows.
  Readonly<
    | { tag: typeof frameTag; kind: 'hello'; paneId: number }
    | {
        tag: typeof frameTag;
        kind: 'state';
        paneId: number;
        url: string;
        title: string;
        historyLength: number;
      }
    | { tag: typeof frameTag; kind: 'leaving'; paneId: number; url: string }
    | {
        tag: typeof frameTag;
        kind: 'service-workers';
        paneId: number;
        count: number;
      }
    | { tag: typeof frameTag; kind: 'shortcut'; paneId: number; code: string }
    | { tag: typeof frameTag; kind: 'zoom'; paneId: number; step: 'in' | 'out' }
  >;

/** From a frame nested in a pane's page, to the frame that contains it. */
export type NestedKey = Readonly<{
  tag: typeof frameTag;
  kind: 'nested-key';
  key: PaneKey;
}>;

/** Worker → a frame: which pane are you? Answered with an id or `null`. */
export type PaneOfFrameQuery = Readonly<{
  tag: typeof workerTag;
  kind: 'pane-of-frame';
}>;

/** Worker → the split view pages: the one in `tabId` splits a pane (spec M2). */
export type SplitOpenRequest = Readonly<{
  tag: typeof workerTag;
  kind: 'split-open';
  tabId: number;
  paneId: number | undefined;
  axis: SplitAxis;
  url: string | undefined;
}>;

export type GitHubMessage = Readonly<
  | {
      tag: typeof githubTag;
      kind: 'open';
      url: string;
      title: string | undefined;
      issueUrl: string | undefined;
      sessionUrl: string | undefined;
      /** `false` for a Ctrl+click or a middle click: open behind. */
      active: boolean;
      /** The split view takes the place of the tab it was asked from. */
      closeOpener: boolean;
    } // Worker → GitHub content script: read this pull request and `open` it.
  | { tag: typeof githubTag; kind: 'look-up'; url: string }
>;

/** A page asking the service worker to change the saved list. */
export type ListRequest = Readonly<{
  tag: typeof listTag;
  kind: 'list-op';
  op: ListOp;
}>;

/**
 * A page asking the worker to put an origin on the always-clear list, or take
 * it off (spec P15): the list's one writer too, so that two toggles never undo
 * each other.
 */
export type ResetOriginRequest = Readonly<{
  tag: typeof listTag;
  kind: 'reset-origin';
  origin: string;
  enabled: boolean;
}>;

/** The worker's answer: the always-clear origins as it stored them. */
export type ResetOriginsReply = Readonly<{
  tag: typeof listTag;
  kind: 'reset-origins';
  origins: readonly string[];
}>;

/** The worker's answer: the list as it stored it, and what the change says. */
export type ListReply = Readonly<{
  tag: typeof listTag;
  kind: 'list';
  list: SplitViewList;
  answer: ListAnswer;
}>;

export const asFrameToPage = (value: unknown): FrameToPage | undefined => {
  const message = tagged(value, frameTag);

  if (message === undefined) {
    return undefined;
  }

  const paneId = asPaneId(message['paneId']);

  if (paneId === undefined) {
    return undefined;
  }

  switch (message['kind']) {
    case 'state': {
      const url = stringField(message, 'url');

      const title = stringField(message, 'title');

      const historyLength = numberField(message, 'historyLength');

      return url === undefined ||
        title === undefined ||
        historyLength === undefined
        ? undefined
        : { tag: frameTag, kind: 'state', paneId, url, title, historyLength };
    }

    case 'leaving': {
      const url = paneAddressOf(stringField(message, 'url') ?? '');

      return url === undefined
        ? undefined
        : { tag: frameTag, kind: 'leaving', paneId, url };
    }

    case 'service-workers': {
      const count = numberField(message, 'count');

      return count === undefined
        ? undefined
        : { tag: frameTag, kind: 'service-workers', paneId, count };
    }

    case 'hello':
      return { tag: frameTag, kind: 'hello', paneId };

    case 'shortcut': {
      const code = stringField(message, 'code');

      return code === undefined
        ? undefined
        : { tag: frameTag, kind: 'shortcut', paneId, code };
    }

    case 'zoom': {
      const step = message['step'];

      return step === 'in' || step === 'out'
        ? { tag: frameTag, kind: 'zoom', paneId, step }
        : undefined;
    }

    default:
      return undefined;
  }
};

export const asPageToFrame = (value: unknown): PageToFrame | undefined => {
  const message = tagged(value, frameTag);

  const paneId =
    message === undefined ? undefined : asPaneId(message['paneId']);

  if (message === undefined || paneId === undefined) {
    return undefined;
  }

  switch (message['kind']) {
    case 'assign':
      return { tag: frameTag, kind: 'assign', paneId };

    case 'unregister-service-workers':
      return { tag: frameTag, kind: 'unregister-service-workers', paneId };

    case 'command': {
      const command = message['command'];

      return command === 'back' || command === 'forward' || command === 'reload'
        ? { tag: frameTag, kind: 'command', paneId, command }
        : undefined;
    }

    default:
      return undefined;
  }
};

export const asNestedKey = (value: unknown): NestedKey | undefined => {
  const message = tagged(value, frameTag);

  if (message?.['kind'] !== 'nested-key') {
    return undefined;
  }

  const key = message['key'];

  if (!isRecord(key)) {
    return undefined;
  }

  if (key['kind'] === 'reload') {
    return { tag: frameTag, kind: 'nested-key', key: { kind: 'reload' } };
  }

  const code = stringField(key, 'code');

  return code !== undefined &&
    key['kind'] === 'workspace' &&
    /^Digit[1-9]$/u.test(code)
    ? { tag: frameTag, kind: 'nested-key', key: { kind: 'workspace', code } }
    : undefined;
};

export const isPaneOfFrameQuery = (value: unknown): boolean =>
  tagged(value, workerTag)?.['kind'] === 'pane-of-frame';

/** The pane a frame's `name` says it is. */
export const paneIdOfFrameName = (frameName: string): number | undefined => {
  if (!frameName.startsWith(paneFrameNamePrefix)) {
    return undefined;
  }

  const digits = frameName.slice(paneFrameNamePrefix.length);

  return /^\d{1,9}$/u.test(digits)
    ? Result.unwrapOkOr(Num.safeParseInt(digits), Number.NaN)
    : undefined;
};

export const asSplitOpenRequest = (
  value: unknown,
): SplitOpenRequest | undefined => {
  const message = tagged(value, workerTag);

  if (message?.['kind'] !== 'split-open') {
    return undefined;
  }

  const tabId = numberField(message, 'tabId');

  const axis = message['axis'];

  return tabId === undefined || (axis !== 'row' && axis !== 'column')
    ? undefined
    : {
        tag: workerTag,
        kind: 'split-open',
        tabId,
        paneId: asPaneId(message['paneId']),
        axis,
        url: stringField(message, 'url'),
      };
};

export const asGitHubMessage = (value: unknown): GitHubMessage | undefined => {
  const message = tagged(value, githubTag);

  const url = message === undefined ? undefined : stringField(message, 'url');

  if (message === undefined || url === undefined) {
    return undefined;
  }

  switch (message['kind']) {
    case 'look-up':
      return { tag: githubTag, kind: 'look-up', url };

    case 'open': {
      const { active, closeOpener, title, issueUrl, sessionUrl } = message;

      return typeof active === 'boolean' &&
        typeof closeOpener === 'boolean' &&
        isOptionalString(title) &&
        isOptionalString(issueUrl) &&
        isOptionalString(sessionUrl)
        ? {
            tag: githubTag,
            kind: 'open',
            url,
            title,
            issueUrl,
            sessionUrl,
            active,
            closeOpener,
          }
        : undefined;
    }

    default:
      return undefined;
  }
};

export const asListRequest = (value: unknown): ListRequest | undefined => {
  const message = tagged(value, listTag);

  const op =
    message?.['kind'] === 'list-op' ? parseListOp(message['op']) : undefined;

  return op === undefined ? undefined : { tag: listTag, kind: 'list-op', op };
};

export const asListReply = (value: unknown): ListReply | undefined => {
  const message = tagged(value, listTag);

  if (message?.['kind'] !== 'list') {
    return undefined;
  }

  const list = parseList(message['list']);

  const answer = parseListAnswer(message['answer']);

  return list === undefined || answer === undefined
    ? undefined
    : { tag: listTag, kind: 'list', list, answer };
};

export const asResetOriginRequest = (
  value: unknown,
): ResetOriginRequest | undefined => {
  const message = tagged(value, listTag);

  if (message?.['kind'] !== 'reset-origin') {
    return undefined;
  }

  const origin = stringField(message, 'origin');

  const enabled = message['enabled'];

  return origin === undefined || typeof enabled !== 'boolean'
    ? undefined
    : { tag: listTag, kind: 'reset-origin', origin, enabled };
};

export const asResetOriginsReply = (
  value: unknown,
): ResetOriginsReply | undefined => {
  const message = tagged(value, listTag);

  return message?.['kind'] === 'reset-origins' &&
    Arr.isArray(message['origins'])
    ? {
        tag: listTag,
        kind: 'reset-origins',
        origins: parseOrigins(message['origins']),
      }
    : undefined;
};

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === 'string';

/** Each operation's fields, every one required; anything else is refused. */
const parseListOp = (value: unknown): ListOp | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = stringField(value, 'id');

  const now = numberField(value, 'now');

  switch (value['kind']) {
    case 'show': {
      const name = value['name'];

      const activate = value['activate'];

      return typeof activate !== 'boolean' ||
        now === undefined ||
        !isOptionalString(value['id']) ||
        !isOptionalString(name)
        ? undefined
        : { kind: 'show', id: value['id'], name, now, activate };
    }

    case 'create':
      return id === undefined || now === undefined
        ? undefined
        : { kind: 'create', id, now };

    case 'remove': {
      const freshId = stringField(value, 'freshId');

      return id === undefined || freshId === undefined || now === undefined
        ? undefined
        : { kind: 'remove', id, freshId, now };
    }

    case 'rename': {
      const name = stringField(value, 'name');

      return id === undefined || name === undefined
        ? undefined
        : { kind: 'rename', id, name };
    }

    case 'move': {
      const offset = numberField(value, 'offset');

      return id === undefined || offset === undefined
        ? undefined
        : { kind: 'move', id, offset };
    }

    case 'activate':
      return id === undefined ? undefined : { kind: 'activate', id };

    case 'set-pinned': {
      const pinned = value['pinned'];

      return id === undefined || typeof pinned !== 'boolean'
        ? undefined
        : { kind: 'set-pinned', id, pinned };
    }

    case 'import': {
      const entries = value['entries'];

      if (now === undefined || !Arr.isArray(entries)) {
        return undefined;
      }

      const parsed = entries.map((entry) =>
        isRecord(entry)
          ? {
              id: nonEmpty(stringField(entry, 'id')),
              name: stringField(entry, 'name'),
            }
          : undefined,
      );

      return parsed.every(
        (entry) => entry?.id !== undefined && entry.name !== undefined,
      )
        ? {
            kind: 'import',
            entries: parsed.map((entry) => ({
              id: entry?.id ?? '',
              name: entry?.name ?? '',
            })),
            now,
          }
        : undefined;
    }

    default:
      return undefined;
  }
};

const parseListAnswer = (value: unknown): ListAnswer | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  switch (value['kind']) {
    case 'none':
      return { kind: 'none' };

    case 'shown': {
      const id = stringField(value, 'id');

      return id === undefined ? undefined : { kind: 'shown', id };
    }

    case 'imported': {
      const added = numberField(value, 'added');

      const replaced = numberField(value, 'replaced');

      return added === undefined || replaced === undefined
        ? undefined
        : { kind: 'imported', added, replaced };
    }

    default:
      return undefined;
  }
};

const tagged = (value: unknown, tag: string): UnknownRecord | undefined =>
  isRecord(value) && hasKey(value, 'tag') && value.tag === tag
    ? value
    : undefined;
