// cspell:ignore lhhkkeicbmoknblbphpjjgplhjckgcmf
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * The pane bridge: how another extension puts a button in a pane of a split
 * view, and acts on the pane's page when it is pressed.
 *
 * It exists because Chrome lets no extension touch a frame inside another
 * extension's page: neither a content script nor `chrome.scripting` reaches a
 * page in a pane of `split.html`. Split View's own content script does run
 * there, so it does the work, on the partner's behalf:
 *
 * 1. When a pane shows a page, Split View asks each partner which buttons that
 *    address gets (`buttons`), and draws them at the pane's bottom left.
 * 2. When one is pressed, Split View tells the partner (`press`) which pane it
 *    was, and waits for the outcome to show on the button.
 * 3. Until it has the outcome, and only then, the partner may ask Split View to
 *    run `DomOp`s on that pane's page (`dom`): find elements, read them, click
 *    them, type into them.
 *
 * Split View knows nothing of what the buttons do — GitHub's label picker, say
 * — so a change to that never needs an update of Split View, which would close
 * every split view open. What it does know is the vocabulary below, which is
 * kept small and general so that it need not change.
 *
 * Messages go between the two service workers with
 * `chrome.runtime.sendMessage(<the other id>, …)`, and each side checks the
 * sender's id: Split View answers only `paneBridgePartnerIds`, and a partner
 * only `splitViewExtensionId`. Both ids are the ones the `key` in each manifest
 * pins on a build from source, so a build from the Chrome Web Store, whose id
 * is its own, takes no part.
 */
export const paneBridgeTag = 'split-view/pane-bridge/v1';

/**
 * GitHub View Defaults (`apps/github-view-defaults-extension`), by the id the
 * `key` in its manifest gives an unpacked build. Its tests derive the id from
 * the key and compare.
 */
export const githubViewDefaultsExtensionId = 'lhhkkeicbmoknblbphpjjgplhjckgcmf';

/** The extensions Split View draws buttons for and acts for. */
export const paneBridgePartnerIds: readonly string[] = [
  githubViewDefaultsExtensionId,
] as const;

/**
 * A button a partner puts in a pane. `label` is shown while it is idle,
 * `busyLabel` while the partner works on a press, `title` as its tooltip.
 */
export type PaneButton = Readonly<{
  id: string;
  label: string;
  busyLabel: string;
  title: string;
}>;

/** What a press came to, shown on the button for a few seconds. */
export type PaneButtonOutcome = Readonly<{
  label: string;
  tone: 'success' | 'failure';
}>;

/** A pane, as Chrome names its frame: the tab, and the frame in it. */
export type PaneRef = Readonly<{ tabId: number; frameId: number }>;

/**
 * One step on a pane's page. An element is named by a handle, a number the page
 * side gives out for each element it returns and keeps for the life of the
 * document; a handle from another document names nothing.
 *
 * - `location`: the page's address.
 * - `query`, `queryAll`: `querySelector` / `querySelectorAll`, of the document
 *   or of the element `within` names.
 * - `closest`, `parent`: the nearest ancestor matching, the parent element.
 * - `contains`: whether `handle` contains `other`.
 * - `attribute`, `text`, `tagName`: `getAttribute`, the trimmed
 *   `textContent`, the upper-case tag name.
 * - `isOpen`: a `<details>` element's `open`.
 * - `click`: `click()`.
 * - `input`: sets an input's value and fires `input`, as typing would.
 * - `key`: fires `keydown` with that `key`, bubbling and cancelable.
 */
export type DomOp = Readonly<
  | { op: 'location' }
  | { op: 'query'; selector: string; within: number | undefined }
  | { op: 'queryAll'; selector: string; within: number | undefined }
  | { op: 'closest'; handle: number; selector: string }
  | { op: 'parent'; handle: number }
  | { op: 'contains'; handle: number; other: number }
  | { op: 'attribute'; handle: number; name: string }
  | { op: 'text'; handle: number }
  | { op: 'tagName'; handle: number }
  | { op: 'isOpen'; handle: number }
  | { op: 'click'; handle: number }
  | { op: 'input'; handle: number; value: string }
  | { op: 'key'; handle: number; key: string }
>;

/**
 * What a `DomOp` answers: a string, a handle or a list of them, a boolean, or
 * `null` for "no such element" and for an op that answers nothing.
 */
export type DomValue = string | number | boolean | null | readonly number[];

/** From Split View to a partner. */
export type ToPartnerMessage = Readonly<
  | { tag: typeof paneBridgeTag; kind: 'buttons'; url: string }
  | {
      tag: typeof paneBridgeTag;
      kind: 'press';
      url: string;
      buttonId: string;
      pane: PaneRef;
    }
>;

/** From a partner to Split View. */
export type ToSplitViewMessage = Readonly<{
  tag: typeof paneBridgeTag;
  kind: 'dom';
  pane: PaneRef;
  op: DomOp;
}>;

export const asToPartnerMessage = (
  value: unknown,
): ToPartnerMessage | undefined => {
  const record = taggedRecordOf(value);

  const url = record === undefined ? undefined : stringAt(record, 'url');

  if (record === undefined || url === undefined) {
    return undefined;
  }

  if (record['kind'] === 'buttons') {
    return { tag: paneBridgeTag, kind: 'buttons', url };
  }

  const buttonId = stringAt(record, 'buttonId');

  const pane = asPaneRef(record['pane']);

  return buttonId !== undefined &&
    pane !== undefined &&
    record['kind'] === 'press'
    ? { tag: paneBridgeTag, kind: 'press', url, buttonId, pane }
    : undefined;
};

export const asToSplitViewMessage = (
  value: unknown,
): ToSplitViewMessage | undefined => {
  const record = taggedRecordOf(value);

  if (record?.['kind'] !== 'dom') {
    return undefined;
  }

  const pane = asPaneRef(record['pane']);

  const op = asDomOp(record['op']);

  return pane === undefined || op === undefined
    ? undefined
    : { tag: paneBridgeTag, kind: 'dom', pane, op };
};

/** A partner's answer to `buttons`: the well-formed ones, none if it is not a list. */
export const asPaneButtons = (value: unknown): readonly PaneButton[] =>
  Arr.isArray(value)
    ? value.filter(
        (button): button is PaneButton =>
          isRecord(button) &&
          hasStringKey(button, 'id') &&
          hasStringKey(button, 'label') &&
          hasStringKey(button, 'busyLabel') &&
          hasStringKey(button, 'title'),
      )
    : ([] as const);

export const asPaneButtonOutcome = (
  value: unknown,
): PaneButtonOutcome | undefined =>
  isRecord(value) &&
  hasKey(value, 'label') &&
  typeof value.label === 'string' &&
  hasKey(value, 'tone') &&
  (value.tone === 'success' || value.tone === 'failure')
    ? ({ label: value.label, tone: value.tone } as const)
    : undefined;

export const asDomOp = (value: unknown): DomOp | undefined => {
  if (!isRecord(value) || !hasKey(value, 'op')) {
    return undefined;
  }

  const handle = numberAt(value, 'handle');

  switch (value.op) {
    case 'location':
      return { op: 'location' };

    case 'query':
    case 'queryAll': {
      const selector = stringAt(value, 'selector');

      const within = numberAt(value, 'within');

      // `within` may be left out, as JSON leaves out `undefined`, but not be
      // anything other than a handle.
      return selector === undefined ||
        (within === undefined && value['within'] !== undefined)
        ? undefined
        : { op: value.op, selector, within };
    }

    case 'closest': {
      const selector = stringAt(value, 'selector');

      return handle === undefined || selector === undefined
        ? undefined
        : { op: 'closest', handle, selector };
    }

    case 'contains': {
      const other = numberAt(value, 'other');

      return handle === undefined || other === undefined
        ? undefined
        : { op: 'contains', handle, other };
    }

    case 'attribute': {
      const name = stringAt(value, 'name');

      return handle === undefined || name === undefined
        ? undefined
        : { op: 'attribute', handle, name };
    }

    case 'input': {
      const text = stringAt(value, 'value');

      return handle === undefined || text === undefined
        ? undefined
        : { op: 'input', handle, value: text };
    }

    case 'key': {
      const key = stringAt(value, 'key');

      return handle === undefined || key === undefined
        ? undefined
        : { op: 'key', handle, key };
    }

    case 'parent':
    case 'text':
    case 'tagName':
    case 'isOpen':
    case 'click':
      return handle === undefined ? undefined : { op: value.op, handle };

    default:
      return undefined;
  }
};

/** `value` as a record, when it carries this protocol's tag. */
const taggedRecordOf = (
  value: unknown,
): ReadonlyRecord<string, unknown> | undefined =>
  isRecord(value) && value['tag'] === paneBridgeTag ? value : undefined;

const numberAt = (
  record: ReadonlyRecord<string, unknown>,
  key: string,
): number | undefined => {
  const value = record[key];

  return typeof value === 'number' && Number.isSafeInteger(value)
    ? value
    : undefined;
};

const asPaneRef = (value: unknown): PaneRef | undefined => {
  const tabId = isRecord(value) ? numberAt(value, 'tabId') : undefined;

  const frameId = isRecord(value) ? numberAt(value, 'frameId') : undefined;

  return tabId === undefined || frameId === undefined
    ? undefined
    : { tabId, frameId };
};

const stringAt = (
  record: ReadonlyRecord<string, unknown>,
  key: string,
): string | undefined => {
  const value = record[key];

  return typeof value === 'string' ? value : undefined;
};

const hasStringKey = (
  record: ReadonlyRecord<string, unknown>,
  key: string,
): boolean => typeof record[key] === 'string';
