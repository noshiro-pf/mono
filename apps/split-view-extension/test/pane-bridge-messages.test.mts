import { githubViewDefaultsExtensionId } from 'split-view-link';
import {
  asPaneButtonPress,
  asPaneButtonsQuery,
  asPaneDomRequest,
  asPartnerButtons,
  workerMessageTag,
} from '../src/index.mjs';

describe(asPaneButtonPress, () => {
  test("reads a press of a partner's button", () => {
    assert.deepStrictEqual(
      asPaneButtonPress({
        tag: workerMessageTag,
        kind: 'pane-button-press',
        partnerId: githubViewDefaultsExtensionId,
        buttonId: 'merge-queued',
        url: 'https://github.com/o/r/pull/1',
      }),
      {
        tag: workerMessageTag,
        kind: 'pane-button-press',
        partnerId: githubViewDefaultsExtensionId,
        buttonId: 'merge-queued',
        url: 'https://github.com/o/r/pull/1',
      },
    );
  });

  // The worker lets the partner a press names act in the pane until it answers,
  // so a press naming any other extension is no press at all.
  test('refuses a press for an extension that is not a partner', () => {
    assert.isUndefined(
      asPaneButtonPress({
        tag: workerMessageTag,
        kind: 'pane-button-press',
        partnerId: 'abcdefghijklmnopabcdefghijklmnop',
        buttonId: 'merge-queued',
        url: 'https://github.com/o/r/pull/1',
      }),
    );
  });
});

describe(asPartnerButtons, () => {
  test("keeps the partners' well-formed buttons", () => {
    const button = {
      id: 'merge-queued',
      label: '+ merge-queued',
      busyLabel: '… merge-queued',
      title: 'Add the label',
      partnerId: githubViewDefaultsExtensionId,
    } as const;

    assert.deepStrictEqual(
      asPartnerButtons([
        button,
        { ...button, partnerId: 'abcdefghijklmnopabcdefghijklmnop' },
        { ...button, label: 1 },
      ]),
      [button],
    );
  });
});

describe(asPaneButtonsQuery, () => {
  test('reads a question about an address', () => {
    assert.deepStrictEqual(
      asPaneButtonsQuery({
        tag: workerMessageTag,
        kind: 'pane-buttons',
        url: 'https://example.com/',
      }),
      {
        tag: workerMessageTag,
        kind: 'pane-buttons',
        url: 'https://example.com/',
      },
    );
  });
});

describe(asPaneDomRequest, () => {
  test('reads a step, and refuses one it does not know', () => {
    assert.deepStrictEqual(
      asPaneDomRequest({
        tag: workerMessageTag,
        kind: 'pane-dom',
        op: { op: 'text', handle: 2 },
      }),
      {
        tag: workerMessageTag,
        kind: 'pane-dom',
        op: { op: 'text', handle: 2 },
      },
    );

    assert.isUndefined(
      asPaneDomRequest({
        tag: workerMessageTag,
        kind: 'pane-dom',
        op: { op: 'eval', code: '1' },
      }),
    );
  });
});
