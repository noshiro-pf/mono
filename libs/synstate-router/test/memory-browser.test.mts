import { createMemoryBrowser } from '../src/index.mjs';

const nextTask = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

describe(createMemoryBrowser, () => {
  test('resolves pushState and replaceState against the current URL', () => {
    const browser = createMemoryBrowser('https://example.com/a/');

    browser.history.pushState(null, '', 'b/?x=1');

    assert.strictEqual(browser.location.href, 'https://example.com/a/b/?x=1');

    browser.history.replaceState(null, '', '/c/');

    assert.strictEqual(browser.url().pathname, '/c/');
  });

  test('moves through the history and fires popstate in a later task', async () => {
    const browser = createMemoryBrowser('https://example.com/');

    browser.history.pushState(null, '', '/a/');

    const mut_fired: string[] = [];

    const listener = (): void => {
      mut_fired.push(browser.url().pathname);
    };

    browser.addEventListener('popstate', listener);

    browser.history.go(-1);

    await Promise.resolve();

    assert.deepStrictEqual(mut_fired, []);

    await nextTask();

    assert.deepStrictEqual(mut_fired, ['/']);

    // Past either end: nothing moves and nothing fires.
    browser.history.go(-1);

    await nextTask();

    assert.deepStrictEqual(mut_fired, ['/']);

    browser.removeEventListener('popstate', listener);

    browser.history.go(1);

    await nextTask();

    assert.strictEqual(browser.url().pathname, '/a/');

    assert.deepStrictEqual(mut_fired, ['/']);
  });

  test('ignores a move past either end, as a browser does', async () => {
    const browser = createMemoryBrowser('https://example.com/a/');

    browser.history.pushState(null, '', '/b/');

    browser.history.pushState(null, '', '/c/');

    browser.history.go(-5);

    await nextTask();

    assert.strictEqual(browser.url().pathname, '/c/');

    // A browser converts the delta to an integer: 0.5 and NaN are no move.
    browser.history.go(0.5);

    browser.history.go(Number.NaN);

    await nextTask();

    assert.strictEqual(browser.url().pathname, '/c/');

    browser.history.go(-2);

    await nextTask();

    assert.strictEqual(browser.url().pathname, '/a/');

    browser.history.pushState(null, '', '/d/');

    assert.strictEqual(browser.url().pathname, '/d/');
  });

  test('pushState drops the entries ahead', async () => {
    const browser = createMemoryBrowser('https://example.com/');

    browser.history.pushState(null, '', '/a/');

    browser.history.go(-1);

    await nextTask();

    browser.history.pushState(null, '', '/b/');

    browser.history.go(1);

    await nextTask();

    assert.strictEqual(browser.url().pathname, '/b/');
  });

  test('setHash is a fragment navigation: an entry, popstate and a scroll, at once', () => {
    const browser = createMemoryBrowser('https://example.com/a/');

    const mut_fired: string[] = [];

    browser.addEventListener('popstate', () => {
      mut_fired.push(browser.url().hash);
    });

    browser.setHash('#x%20y');

    assert.deepStrictEqual(mut_fired, ['#x%20y']);

    assert.deepStrictEqual(browser.scrolls(), ['#x y']);

    // The same hash again scrolls without a new entry.
    browser.setHash('#x%20y');

    assert.deepStrictEqual(mut_fired, ['#x%20y']);

    assert.deepStrictEqual(browser.scrolls(), ['#x y', '#x y']);
  });

  test('runs afterRender callbacks in a later task, and records scrolls', async () => {
    const browser = createMemoryBrowser('https://example.com/');

    browser.afterRender(() => {
      browser.scrollToTop();
    });

    browser.scrollToFragment('a');

    assert.deepStrictEqual(browser.scrolls(), ['#a']);

    await nextTask();

    assert.deepStrictEqual(browser.scrolls(), ['#a', 'top']);
  });

  test('has every element and restores no scroll by default', () => {
    const browser = createMemoryBrowser('https://example.com/');

    assert.isTrue(browser.scrollToFragment('a'));

    assert.isFalse(browser.restoresScroll());
  });

  test('scrolls only to an element hasElement has, and records only that', () => {
    const browser = createMemoryBrowser('https://example.com/', {
      hasElement: (id) => id === 'b',
    });

    assert.isFalse(browser.scrollToFragment('a'));

    assert.isTrue(browser.scrollToFragment('b'));

    assert.deepStrictEqual(browser.scrolls(), ['#b']);
  });

  test('reports the restoresScroll it was given', () => {
    const browser = createMemoryBrowser('https://example.com/', {
      restoresScroll: true,
    });

    assert.isTrue(browser.restoresScroll());
  });
});
