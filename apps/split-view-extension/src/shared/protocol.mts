import { hasKey, isRecord } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';

/**
 * Tags every `postMessage` the split view sends or accepts.
 *
 * The page and the frames talk over `postMessage` rather than over
 * `chrome.runtime`, because `postMessage` reaches into a cross-origin frame
 * without the page having to know the frame's id — and a content script
 * receives it even though it runs in an isolated world, since the two worlds
 * share the frame's `window` and event loop.
 */
export const splitViewMessageTag = 'split-view/v1';

/**
 * Prefix of the `name` attribute given to each pane's `iframe`.
 *
 * It is a second way for the frame to recognize where it is embedded, for the
 * case where `location.ancestorOrigins` says nothing useful. A nested browsing
 * context keeps its name across navigations, including cross-origin ones.
 */
export const paneFrameNamePrefix = 'split-view-pane:';

export type FrameCommand = 'back' | 'forward' | 'reload';

/**
 * The part of a `MessageEvent` either side reads.
 *
 * Structural rather than `MessageEvent` itself because a parameter has to be
 * deeply readonly here, and `MessageEvent.source` is a `Window` — mutable all
 * the way down. Naming the three fields that are actually read says as much
 * about the protocol as the full type would.
 */
export type IncomingMessageEvent = Readonly<{
  source: unknown;
  origin: string;
  data: unknown;
}>;

/** Sent by the page, down into one pane's frame. */
export type PageToFrameMessage = Readonly<
  | {
      tag: typeof splitViewMessageTag;
      kind: 'assign';
      paneId: number;
    }
  | {
      tag: typeof splitViewMessageTag;
      kind: 'command';
      paneId: number;
      command: FrameCommand;
    }
  | {
      tag: typeof splitViewMessageTag;
      kind: 'unregister-service-workers';
      paneId: number;
    }
>;

/** Sent by a pane's frame, up to the page. */
export type FrameToPageMessage = Readonly<
  | {
      tag: typeof splitViewMessageTag;
      kind: 'state';
      paneId: number;
      url: string;
      title: string;
      historyLength: number;
    }
  | {
      tag: typeof splitViewMessageTag;
      kind: 'service-workers';
      paneId: number;
      count: number;
    }
  | {
      tag: typeof splitViewMessageTag;
      kind: 'shortcut';
      paneId: number;
      /** `KeyboardEvent.code`, so that it is the *key*, not what it types. */
      code: string;
    }
  | {
      tag: typeof splitViewMessageTag;
      kind: 'zoom';
      paneId: number;
      step: 'in' | 'out';
    }
>;

/**
 * Validates a message from a frame.
 *
 * The sender is an arbitrary web page, so nothing here is assumed: the page
 * additionally checks that `event.source` is the very frame it thinks it is
 * talking to, which is what stops one pane from reporting on another's behalf.
 *
 * `shortcut` is the exception to that last check, since it is handled by the
 * page rather than by one pane's component and so has no frame to compare
 * against. What a forged one can do is switch the tab to another of the user's
 * own split views, which is what pressing the key would have done anyway.
 */
export const asFrameToPageMessage = (
  value: unknown,
): FrameToPageMessage | undefined => {
  if (!isTaggedMessage(value)) {
    return undefined;
  }

  if (!hasKey(value, 'kind')) {
    return undefined;
  }

  if (value.kind === 'zoom') {
    return hasKey(value, 'paneId') &&
      typeof value.paneId === 'number' &&
      hasKey(value, 'step') &&
      (value.step === 'in' || value.step === 'out')
      ? {
          tag: splitViewMessageTag,
          kind: 'zoom',
          paneId: value.paneId,
          step: value.step,
        }
      : undefined;
  }

  if (value.kind === 'shortcut') {
    return hasKey(value, 'paneId') &&
      typeof value.paneId === 'number' &&
      hasKey(value, 'code') &&
      typeof value.code === 'string'
      ? {
          tag: splitViewMessageTag,
          kind: 'shortcut',
          paneId: value.paneId,
          code: value.code,
        }
      : undefined;
  }

  if (value.kind === 'service-workers') {
    return hasKey(value, 'paneId') &&
      typeof value.paneId === 'number' &&
      hasKey(value, 'count') &&
      typeof value.count === 'number'
      ? {
          tag: splitViewMessageTag,
          kind: 'service-workers',
          paneId: value.paneId,
          count: value.count,
        }
      : undefined;
  }

  if (value.kind !== 'state') {
    return undefined;
  }

  if (
    hasKey(value, 'paneId') &&
    typeof value.paneId === 'number' &&
    hasKey(value, 'url') &&
    typeof value.url === 'string' &&
    hasKey(value, 'title') &&
    typeof value.title === 'string' &&
    hasKey(value, 'historyLength') &&
    typeof value.historyLength === 'number'
  ) {
    return {
      tag: splitViewMessageTag,
      kind: 'state',
      paneId: value.paneId,
      url: value.url,
      title: value.title,
      historyLength: value.historyLength,
    };
  }

  return undefined;
};

/** Validates a message from the page, as seen by the frame. */
export const asPageToFrameMessage = (
  value: unknown,
): PageToFrameMessage | undefined => {
  if (!isTaggedMessage(value)) {
    return undefined;
  }

  if (!(hasKey(value, 'paneId') && typeof value.paneId === 'number')) {
    return undefined;
  }

  if (!hasKey(value, 'kind')) {
    return undefined;
  }

  if (value.kind === 'assign') {
    return { tag: splitViewMessageTag, kind: 'assign', paneId: value.paneId };
  }

  if (value.kind === 'unregister-service-workers') {
    return {
      tag: splitViewMessageTag,
      kind: 'unregister-service-workers',
      paneId: value.paneId,
    };
  }

  if (value.kind === 'command') {
    return hasKey(value, 'command') && isFrameCommand(value.command)
      ? {
          tag: splitViewMessageTag,
          kind: 'command',
          paneId: value.paneId,
          command: value.command,
        }
      : undefined;
  }

  return undefined;
};

const isTaggedMessage = (value: unknown): value is UnknownRecord =>
  isRecord(value) && hasKey(value, 'tag') && value.tag === splitViewMessageTag;

const isFrameCommand = (value: unknown): value is FrameCommand =>
  value === 'back' || value === 'forward' || value === 'reload';
