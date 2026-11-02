import { externalHref } from 'synstate-router';

if (import.meta.vitest !== undefined) {
  test('externalHref', () => {
    // embed-sample-code-ignore-above

    const docs = externalHref('https://example.com/docs');

    assert.strictEqual(docs, 'https://example.com/docs');

    // embed-sample-code-ignore-below
  });
}
