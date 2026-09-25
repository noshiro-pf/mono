import { asFrameToPageMessage, splitViewMessageTag } from '../src/index.mjs';

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
