import { Optional } from 'ts-data-forge';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
} from '../src/index.mjs';

const routes = defineRoutes({
  home: { segment: '' },
  about: {},
});

const nextTask = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

describe('viewTransition', () => {
  test('runs the navigation inside startViewTransition, finishing once the page is drawn', async () => {
    const browser = createMemoryBrowser('https://example.com/', {
      viewTransitions: true,
    });

    const router = createRouter(routes, { browser });

    router.push(routes.about.href(), { viewTransition: true });

    // The browser captures the old page first, and runs the update later.
    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'home',
    );

    await nextTask();

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'about',
    );

    assert.deepStrictEqual(browser.viewTransitions(), ['running']);

    // A binding's `Routes` says the page is drawn: the transition finishes in
    // microtasks, before the frame that would end it without one.
    router.flushScroll();

    for (const _ of [1, 2, 3, 4]) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.resolve();
    }

    assert.deepStrictEqual(browser.viewTransitions(), ['finished']);

    router.dispose();
  });

  test('navigates at once where the browser has no View Transitions', () => {
    const browser = createMemoryBrowser('https://example.com/');

    const router = createRouter(routes, { browser });

    router.push(routes.about.href(), { viewTransition: true });

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'about',
    );

    router.dispose();
  });

  test('is not used unless asked for', () => {
    const browser = createMemoryBrowser('https://example.com/', {
      viewTransitions: true,
    });

    const router = createRouter(routes, { browser });

    router.replace(routes.about.href());

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'about',
    );

    assert.deepStrictEqual(browser.viewTransitions(), []);

    router.dispose();
  });
});
