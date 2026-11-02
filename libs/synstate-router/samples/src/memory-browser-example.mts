import { createMemoryBrowser } from 'synstate-router';

if (import.meta.vitest !== undefined) {
  test('createMemoryBrowser', async () => {
    // embed-sample-code-ignore-above

    const browser = createMemoryBrowser('https://example.com/');

    browser.history.pushState(null, '', '/products/');

    assert.strictEqual(browser.url().pathname, '/products/');

    browser.history.go(-1);

    // A browser moves through the history in a later task.
    assert.strictEqual(browser.url().pathname, '/products/');

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    assert.strictEqual(browser.url().pathname, '/');

    // embed-sample-code-ignore-below
  });
}
