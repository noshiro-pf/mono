import {
  asDomOp,
  asPaneButtons,
  paneBridgePartnerIds,
  type DomOp,
  type PaneButton,
} from 'split-view-link';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import { workerMessageTag } from './worker-messages.mjs';

/**
 * The messages between a pane's content script and the worker that carry the
 * pane bridge (`pane-bridge.mts` in `split-view-link`): the content script asks
 * for a pane's buttons and reports a press, and the worker passes on the
 * partner's steps.
 */

/** A partner's button, with the partner it belongs to. */
export type PartnerButton = PaneButton & Readonly<{ partnerId: string }>;

/**
 * Pane to worker: which buttons does a page at `url` get? Answered with a list
 * of `PartnerButton`s, empty when no partner answers.
 */
export type PaneButtonsQuery = Readonly<{
  tag: typeof workerMessageTag;
  kind: 'pane-buttons';
  url: string;
}>;

/**
 * Pane to worker: this pane's button was pressed. Answered with the partner's
 * `PaneButtonOutcome`, or `undefined` when it gave none. The pane is the
 * sender's frame, which the worker reads off the message, so a pane cannot name
 * another.
 */
export type PaneButtonPress = Readonly<{
  tag: typeof workerMessageTag;
  kind: 'pane-button-press';
  partnerId: string;
  buttonId: string;
  url: string;
}>;

/** Worker to pane: run this step, for the partner whose press is in flight. */
export type PaneDomRequest = Readonly<{
  tag: typeof workerMessageTag;
  kind: 'pane-dom';
  op: DomOp;
}>;

export const asPaneButtonsQuery = (
  value: unknown,
): PaneButtonsQuery | undefined => {
  const url = stringAt(value, 'url');

  return url !== undefined && kindOf(value) === 'pane-buttons'
    ? { tag: workerMessageTag, kind: 'pane-buttons', url }
    : undefined;
};

export const asPaneButtonPress = (
  value: unknown,
): PaneButtonPress | undefined => {
  const partnerId = stringAt(value, 'partnerId');

  const buttonId = stringAt(value, 'buttonId');

  const url = stringAt(value, 'url');

  return partnerId !== undefined &&
    buttonId !== undefined &&
    url !== undefined &&
    paneBridgePartnerIds.includes(partnerId) &&
    kindOf(value) === 'pane-button-press'
    ? {
        tag: workerMessageTag,
        kind: 'pane-button-press',
        partnerId,
        buttonId,
        url,
      }
    : undefined;
};

export const asPaneDomRequest = (
  value: unknown,
): PaneDomRequest | undefined => {
  const op =
    isRecord(value) && hasKey(value, 'op') ? asDomOp(value.op) : undefined;

  return op !== undefined && kindOf(value) === 'pane-dom'
    ? { tag: workerMessageTag, kind: 'pane-dom', op }
    : undefined;
};

/** The worker's answer to a `PaneButtonsQuery`: the well-formed buttons. */
export const asPartnerButtons = (value: unknown): readonly PartnerButton[] =>
  Arr.isArray(value)
    ? Arr.generate(function* () {
        for (const entry of value) {
          const partnerId = stringAt(entry, 'partnerId');

          const [button] = asPaneButtons([entry]);

          if (
            partnerId !== undefined &&
            button !== undefined &&
            paneBridgePartnerIds.includes(partnerId)
          ) {
            yield { ...button, partnerId };
          }
        }
      })
    : ([] as const);

const kindOf = (value: unknown): unknown =>
  isRecord(value) && value['tag'] === workerMessageTag
    ? value['kind']
    : undefined;

const stringAt = (value: unknown, key: string): string | undefined => {
  const field = isRecord(value) ? value[key] : undefined;

  return typeof field === 'string' ? field : undefined;
};
