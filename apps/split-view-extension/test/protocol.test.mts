import {
  asFrameToPageMessage,
  asNestedFrameMessage,
  splitViewMessageTag,
} from '../src/index.mjs';

describe('asFrameToPageMessage', () => {
  describe('leaving', () => {
    test('accepts where a document is navigating to', () => {
      assert.deepStrictEqual(
        asFrameToPageMessage({
          tag: splitViewMessageTag,
          kind: 'leaving',
          paneId: 3,
          url: 'https://github.com/noshiro-pf/mono/issues',
        }),
        {
          tag: splitViewMessageTag,
          kind: 'leaving',
          paneId: 3,
          url: 'https://github.com/noshiro-pf/mono/issues',
        },
      );
    });

    test('drops fields the message does not have', () => {
      assert.deepStrictEqual(
        asFrameToPageMessage({
          tag: splitViewMessageTag,
          kind: 'leaving',
          paneId: 3,
          url: 'https://example.com/',
          extra: true,
        }),
        {
          tag: splitViewMessageTag,
          kind: 'leaving',
          paneId: 3,
          url: 'https://example.com/',
        },
      );
    });

    test('refuses one without an address', () => {
      assert.isUndefined(
        asFrameToPageMessage({
          tag: splitViewMessageTag,
          kind: 'leaving',
          paneId: 3,
        }),
      );
    });

    test('refuses one without a pane', () => {
      assert.isUndefined(
        asFrameToPageMessage({
          tag: splitViewMessageTag,
          kind: 'leaving',
          url: 'https://example.com/',
        }),
      );
    });

    test('refuses one with another tag', () => {
      assert.isUndefined(
        asFrameToPageMessage({
          tag: 'someone-else',
          kind: 'leaving',
          paneId: 3,
          url: 'https://example.com/',
        }),
      );
    });
  });
});

describe(asNestedFrameMessage, () => {
  test('accepts a reload', () => {
    assert.deepStrictEqual(
      asNestedFrameMessage({
        tag: splitViewMessageTag,
        kind: 'nested-key',
        key: { kind: 'reload' },
      }),
      {
        tag: splitViewMessageTag,
        kind: 'nested-key',
        key: { kind: 'reload' },
      },
    );
  });

  test('accepts a workspace shortcut, dropping fields it does not have', () => {
    assert.deepStrictEqual(
      asNestedFrameMessage({
        tag: splitViewMessageTag,
        kind: 'nested-key',
        key: { kind: 'workspace', code: 'Digit3', extra: true },
        extra: true,
      }),
      {
        tag: splitViewMessageTag,
        kind: 'nested-key',
        key: { kind: 'workspace', code: 'Digit3' },
      },
    );
  });

  test('refuses a workspace shortcut that is not a digit key', () => {
    assert.isUndefined(
      asNestedFrameMessage({
        tag: splitViewMessageTag,
        kind: 'nested-key',
        key: { kind: 'workspace', code: 'KeyW' },
      }),
    );
  });

  test('refuses a workspace shortcut without a key code', () => {
    assert.isUndefined(
      asNestedFrameMessage({
        tag: splitViewMessageTag,
        kind: 'nested-key',
        key: { kind: 'workspace' },
      }),
    );
  });

  test('refuses an unknown key', () => {
    assert.isUndefined(
      asNestedFrameMessage({
        tag: splitViewMessageTag,
        kind: 'nested-key',
        key: { kind: 'close' },
      }),
    );
  });

  test('refuses another kind or another tag', () => {
    assert.isUndefined(
      asNestedFrameMessage({
        tag: splitViewMessageTag,
        kind: 'shortcut',
        key: { kind: 'reload' },
      }),
    );

    assert.isUndefined(
      asNestedFrameMessage({
        tag: 'someone-else',
        kind: 'nested-key',
        key: { kind: 'reload' },
      }),
    );
  });
});
