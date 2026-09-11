import { unframeableKindOf } from '../src/index.mjs';

describe('unframeableKindOf', () => {
  test('says nothing against an ordinary page', () => {
    assert.deepStrictEqual(
      unframeableKindOf('https://example.com/a?b=c#d'),
      undefined,
    );

    assert.deepStrictEqual(
      unframeableKindOf('http://localhost:5173/'),
      undefined,
    );
  });

  test('recognizes the browser\u{2019}s own pages', () => {
    assert.deepStrictEqual(
      unframeableKindOf('chrome://settings'),
      'browser-page',
    );

    assert.deepStrictEqual(
      unframeableKindOf('chrome://version'),
      'browser-page',
    );

    assert.deepStrictEqual(
      unframeableKindOf('view-source:https://example.com/'),
      'browser-page',
    );

    assert.deepStrictEqual(unframeableKindOf('about:srcdoc'), 'browser-page');
  });

  test('leaves a blank page alone: it is blank on purpose', () => {
    assert.deepStrictEqual(unframeableKindOf('about:blank'), undefined);

    assert.deepStrictEqual(unframeableKindOf(''), undefined);
  });

  test('recognizes an extension page', () => {
    assert.deepStrictEqual(
      unframeableKindOf('chrome-extension://abcdefghijklmnop/split.html'),
      'extension-page',
    );
  });

  test('recognizes a local file', () => {
    assert.deepStrictEqual(
      unframeableKindOf('file:///tmp/a.html'),
      'local-file',
    );
  });

  test('recognizes a scheme no frame navigates to', () => {
    assert.deepStrictEqual(
      unframeableKindOf('ftp://example.com/'),
      'unsupported-scheme',
    );

    assert.deepStrictEqual(
      unframeableKindOf('data:text/html,hello'),
      'unsupported-scheme',
    );
  });

  test('recognizes the Web Store, at both of its addresses', () => {
    assert.deepStrictEqual(
      unframeableKindOf('https://chromewebstore.google.com/detail/x'),
      'web-store',
    );

    assert.deepStrictEqual(
      unframeableKindOf('https://chrome.google.com/webstore/detail/x'),
      'web-store',
    );
  });

  test('and nothing else on that host', () => {
    assert.deepStrictEqual(
      unframeableKindOf('https://chrome.google.com/'),
      undefined,
    );
  });

  test('says nothing about what it cannot parse', () => {
    assert.deepStrictEqual(unframeableKindOf('not an address'), undefined);
  });
});
