import { createMemoryBrowser } from 'tiny-router-observable';
import { Optional } from 'ts-data-forge';
import { createAppRouter } from './router-store.mjs';

describe(createAppRouter, () => {
  test('sends the root to the create page as it opens', () => {
    const browser = createMemoryBrowser('https://example.com/');

    const router = createAppRouter(browser);

    assert.strictEqual(browser.url().pathname, '/create/');

    assert.isTrue(router.isRoute.createPage$.getSnapshot().value);
  });

  test('reads the event id and the page from the path', () => {
    const browser = createMemoryBrowser('https://example.com/event/abc/');

    const router = createAppRouter(browser);

    assert.strictEqual(router.eventId$.getSnapshot().value, 'abc');

    assert.isTrue(router.isRoute.answerPage$.getSnapshot().value);

    assert.isFalse(router.isRoute.editPage$.getSnapshot().value);

    router.push('/event/abc/edit/');

    assert.isTrue(router.isRoute.editPage$.getSnapshot().value);

    assert.isFalse(router.isRoute.answerPage$.getSnapshot().value);

    assert.deepStrictEqual(router.pathSegments$.getSnapshot().value, [
      'event',
      'abc',
      'edit',
    ]);
  });

  test('names each page by its path', () => {
    const browser = createMemoryBrowser('https://example.com/event-list/');

    const router = createAppRouter(browser);

    assert.isTrue(router.isRoute.eventListPage$.getSnapshot().value);

    router.push('/signIn/');

    assert.isTrue(router.isRoute.signInPage$.getSnapshot().value);

    router.push('/register/');

    assert.isTrue(router.isRoute.registerPage$.getSnapshot().value);

    assert.isFalse(router.isRoute.eventListPage$.getSnapshot().value);
  });

  test('the page to go back to skips the sign-in and register pages', () => {
    const browser = createMemoryBrowser('https://example.com/event-list/');

    const router = createAppRouter(browser);

    const mut_pages: string[] = [];

    router.pageToBack$.subscribe((pathname) => {
      mut_pages.push(pathname);
    });

    router.push('/signIn/');

    router.push('/event/abc/');

    router.push('/register/');

    assert.deepStrictEqual(mut_pages, ['/event-list/', '/event/abc/']);

    assert.deepStrictEqual(
      router.pageToBack$.getSnapshot(),
      Optional.some('/event/abc/'),
    );
  });

  test('follows the browser back', () => {
    const browser = createMemoryBrowser('https://example.com/create/');

    const router = createAppRouter(browser);

    router.push('/event/abc/');

    browser.history.back();

    assert.isTrue(router.isRoute.createPage$.getSnapshot().value);
  });
});
