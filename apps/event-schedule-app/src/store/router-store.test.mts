import { createMemoryBrowser } from 'synstate-router';
import { Optional } from 'ts-data-forge';
import { routes } from '../constants/index.mjs';
import { createAppRouter } from './router-store.mjs';

describe(createAppRouter, () => {
  test('sends the root to the create page as it opens', () => {
    const browser = createMemoryBrowser('https://example.com/');

    const router = createAppRouter(browser);

    assert.strictEqual(browser.url().pathname, '/create/');

    assert.isTrue(
      Optional.unwrap(router.isActive(routes.create).getSnapshot()),
    );
  });

  test('reads the event id and the page from the path', () => {
    const browser = createMemoryBrowser('https://example.com/event/abc/');

    const router = createAppRouter(browser);

    assert.strictEqual(Optional.unwrap(router.eventId$.getSnapshot()), 'abc');

    assert.isTrue(
      Optional.unwrap(
        router.isActive(routes.event.answer, { exact: true }).getSnapshot(),
      ),
    );

    assert.isFalse(
      Optional.unwrap(router.isActive(routes.event.answer.edit).getSnapshot()),
    );

    router.push(routes.event.answer.edit.href({ eventId: 'abc' }));

    assert.isTrue(
      Optional.unwrap(router.isActive(routes.event.answer.edit).getSnapshot()),
    );

    assert.isFalse(
      Optional.unwrap(
        router.isActive(routes.event.answer, { exact: true }).getSnapshot(),
      ),
    );

    assert.strictEqual(Optional.unwrap(router.eventId$.getSnapshot()), 'abc');

    assert.strictEqual(browser.url().pathname, '/event/abc/edit/');
  });

  test('names each page by its path', () => {
    const browser = createMemoryBrowser('https://example.com/event-list/');

    const router = createAppRouter(browser);

    assert.isTrue(
      Optional.unwrap(router.isActive(routes.eventList).getSnapshot()),
    );

    assert.isUndefined(Optional.unwrap(router.eventId$.getSnapshot()));

    router.push(routes.signIn.href());

    assert.strictEqual(browser.url().pathname, '/signIn/');

    assert.isTrue(
      Optional.unwrap(router.isActive(routes.signIn).getSnapshot()),
    );

    router.push(routes.register.href());

    assert.strictEqual(browser.url().pathname, '/register/');

    assert.isTrue(
      Optional.unwrap(router.isActive(routes.register).getSnapshot()),
    );

    assert.isFalse(
      Optional.unwrap(router.isActive(routes.eventList).getSnapshot()),
    );
  });

  test('names no page for an event path without an id or with more after it', () => {
    for (const path of ['/event/', '/event/abc/edit/x/', '/unknown/']) {
      const router = createAppRouter(
        createMemoryBrowser(`https://example.com${path}`),
      );

      assert.deepStrictEqual(
        [path, Optional.unwrap(router.match.getSnapshot()).route],
        [path, undefined],
      );

      assert.deepStrictEqual(
        [path, Optional.unwrap(router.eventId$.getSnapshot())],
        [path, undefined],
      );
    }
  });

  test('the page to go back to skips the sign-in and register pages, and keeps the query', () => {
    const browser = createMemoryBrowser('https://example.com/event-list/');

    const router = createAppRouter(browser);

    const mut_pages: string[] = [];

    router.pageToBack$.subscribe((href) => {
      mut_pages.push(href);
    });

    router.push(routes.signIn.href());

    const answerPage = routes.event.answer.href(
      { eventId: 'abc' },
      { search: { 'sort-by': 'score' } },
    );

    router.push(answerPage);

    router.push(routes.register.href());

    assert.deepStrictEqual(mut_pages, [
      '/event-list/',
      '/event/abc/?sort-by=score',
    ]);

    assert.deepStrictEqual(
      router.pageToBack$.getSnapshot(),
      Optional.some(answerPage),
    );
  });

  test('counts each time the edit page is left', () => {
    const browser = createMemoryBrowser('https://example.com/event/abc/edit/');

    const router = createAppRouter(browser);

    assert.strictEqual(
      Optional.unwrap(router.editPageLeaves$.getSnapshot()),
      0,
    );

    router.push(routes.event.answer.href({ eventId: 'abc' }));

    assert.strictEqual(
      Optional.unwrap(router.editPageLeaves$.getSnapshot()),
      1,
    );

    router.push(routes.event.answer.edit.href({ eventId: 'abc' }));

    router.push(routes.create.href());

    assert.strictEqual(
      Optional.unwrap(router.editPageLeaves$.getSnapshot()),
      2,
    );
  });

  test('a visit lasts until the page shown changes', () => {
    const browser = createMemoryBrowser('https://example.com/event/abc/');

    const router = createAppRouter(browser);

    const isCurrent = router.trackVisit();

    // The same page with another query is the same visit.
    router.replace(
      routes.event.answer.href(
        { eventId: 'abc' },
        { search: { 'sort-by': 'score' } },
      ),
    );

    assert.isTrue(isCurrent());

    router.push(routes.create.href());

    assert.isFalse(isCurrent());

    // Coming back is another visit.
    router.push(routes.event.answer.href({ eventId: 'abc' }));

    assert.isFalse(isCurrent());

    assert.isTrue(router.trackVisit()());
  });

  test('the whole URL of a page is on the origin the app is open at', () => {
    const router = createAppRouter(
      createMemoryBrowser('https://schedule.example:8080/create/?x=1'),
    );

    assert.strictEqual(
      router.absoluteUrlOf(routes.event.answer.href({ eventId: 'abc' })),
      'https://schedule.example:8080/event/abc/',
    );
  });

  test('an address that names no page is not one to go back to', () => {
    const router = createAppRouter(
      createMemoryBrowser('https://example.com/unknown/'),
    );

    assert.deepStrictEqual(router.pageToBack$.getSnapshot(), Optional.none);

    router.push(routes.signIn.href());

    assert.deepStrictEqual(router.pageToBack$.getSnapshot(), Optional.none);

    router.push(routes.eventList.href());

    assert.deepStrictEqual(
      router.pageToBack$.getSnapshot(),
      Optional.some(routes.eventList.href()),
    );
  });

  test('follows the browser back', async () => {
    const browser = createMemoryBrowser('https://example.com/create/');

    const router = createAppRouter(browser);

    router.push(routes.event.answer.href({ eventId: 'abc' }));

    browser.history.go(-1);

    // A browser moves through the history in a later task.
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    assert.isTrue(
      Optional.unwrap(router.isActive(routes.create).getSnapshot()),
    );
  });
});
