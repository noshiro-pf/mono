import {
  asDomOp,
  asPaneButtonOutcome,
  asPaneButtons,
  asToPartnerMessage,
  asToSplitViewMessage,
  paneBridgeTag,
} from '../src/index.mjs';

describe(asToPartnerMessage, () => {
  test('reads a question about the buttons of an address', () => {
    assert.deepStrictEqual(
      asToPartnerMessage({
        tag: paneBridgeTag,
        kind: 'buttons',
        url: 'https://github.com/o/r/pull/1',
      }),
      {
        tag: paneBridgeTag,
        kind: 'buttons',
        url: 'https://github.com/o/r/pull/1',
      },
    );
  });

  test('reads a press, with the pane it was in', () => {
    assert.deepStrictEqual(
      asToPartnerMessage({
        tag: paneBridgeTag,
        kind: 'press',
        url: 'https://github.com/o/r/pull/1',
        buttonId: 'merge-queued',
        pane: { tabId: 3, frameId: 7 },
      }),
      {
        tag: paneBridgeTag,
        kind: 'press',
        url: 'https://github.com/o/r/pull/1',
        buttonId: 'merge-queued',
        pane: { tabId: 3, frameId: 7 },
      },
    );
  });

  test.each([
    ['another tag', { tag: 'other', kind: 'buttons', url: 'x' }],
    ['no address', { tag: paneBridgeTag, kind: 'buttons' }],
    [
      'a press without its pane',
      { tag: paneBridgeTag, kind: 'press', url: 'x', buttonId: 'b' },
    ],
    [
      'a pane that is not two whole numbers',
      {
        tag: paneBridgeTag,
        kind: 'press',
        url: 'x',
        buttonId: 'b',
        pane: { tabId: 1.5, frameId: 0 },
      },
    ],
    ['a message for Split View', { tag: paneBridgeTag, kind: 'dom', url: 'x' }],
  ])('refuses %s', (_name, value) => {
    assert.isUndefined(asToPartnerMessage(value));
  });
});

describe(asToSplitViewMessage, () => {
  test('reads a step for a pane', () => {
    assert.deepStrictEqual(
      asToSplitViewMessage({
        tag: paneBridgeTag,
        kind: 'dom',
        pane: { tabId: 3, frameId: 7 },
        op: { op: 'click', handle: 4 },
      }),
      {
        tag: paneBridgeTag,
        kind: 'dom',
        pane: { tabId: 3, frameId: 7 },
        op: { op: 'click', handle: 4 },
      },
    );
  });

  test('refuses a step it does not know', () => {
    assert.isUndefined(
      asToSplitViewMessage({
        tag: paneBridgeTag,
        kind: 'dom',
        pane: { tabId: 3, frameId: 7 },
        op: { op: 'evaluate', code: 'alert(1)' },
      }),
    );
  });
});

describe(asDomOp, () => {
  test.each([
    [{ op: 'location' }],
    [{ op: 'query', selector: 'a', within: undefined }],
    [{ op: 'queryAll', selector: 'a', within: 2 }],
    [{ op: 'closest', handle: 1, selector: 'details' }],
    [{ op: 'parent', handle: 1 }],
    [{ op: 'contains', handle: 1, other: 2 }],
    [{ op: 'attribute', handle: 1, name: 'aria-checked' }],
    [{ op: 'text', handle: 1 }],
    [{ op: 'tagName', handle: 1 }],
    [{ op: 'isOpen', handle: 1 }],
    [{ op: 'click', handle: 1 }],
    [{ op: 'input', handle: 1, value: 'merge-queued' }],
    [{ op: 'key', handle: 1, key: 'Escape' }],
  ] as const)('reads %o', (op) => {
    assert.deepStrictEqual(asDomOp(op), op);
  });

  test('reads a query whose `within` was left out, as JSON leaves it', () => {
    assert.deepStrictEqual(asDomOp({ op: 'query', selector: 'a' }), {
      op: 'query',
      selector: 'a',
      within: undefined,
    });
  });

  test.each([
    [{ op: 'query' }],
    [{ op: 'query', selector: 'a', within: 'x' }],
    [{ op: 'click' }],
    [{ op: 'click', handle: '1' }],
    [{ op: 'input', handle: 1 }],
    [{ op: 'evaluate', code: '1' }],
    ['click'],
  ] as const)('refuses %o', (op) => {
    assert.isUndefined(asDomOp(op));
  });
});

describe(asPaneButtons, () => {
  test('keeps the well-formed buttons and drops the rest', () => {
    const button = {
      id: 'merge-queued',
      label: '+ merge-queued',
      busyLabel: '… merge-queued',
      title: 'Add the label',
    } as const;

    assert.deepStrictEqual(
      asPaneButtons([button, { id: 'x', label: 'y' }, 'z']),
      [button],
    );
  });

  test('is empty for an answer that is not a list', () => {
    assert.deepStrictEqual(asPaneButtons(undefined), []);
  });
});

describe(asPaneButtonOutcome, () => {
  test('reads an outcome', () => {
    assert.deepStrictEqual(
      asPaneButtonOutcome({ label: '✓ done', tone: 'success' }),
      { label: '✓ done', tone: 'success' },
    );
  });

  test('refuses an unknown tone', () => {
    assert.isUndefined(asPaneButtonOutcome({ label: 'x', tone: 'neutral' }));
  });
});
