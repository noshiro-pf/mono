import { constant } from 'synstate-dom';
import { createMemoryBrowser, createRouter } from 'synstate-router';
import { createRouterComponents } from '../../src/index.mjs';
import { mountInto, nextTask, routes } from './fixture.js';

describe('Routes before the router is ready', () => {
  test('mounts pending, not the page, until an async redirect settles', async () => {
    const mut_check = { settle: (_signedIn: boolean): void => {} };

    const checked = new Promise<boolean>((resolve) => {
      mut_check.settle = resolve;
    });

    const start = new URL('/settings/', globalThis.location.origin);

    const router = createRouter(routes, {
      browser: createMemoryBrowser(start.href),
      redirect: async (m) =>
        m.route === 'settings' && !(await checked)
          ? routes.home.href()
          : undefined,
    });

    const { Routes } = createRouterComponents(router);

    const { container, unmount } = mountInto(() => (
      <Routes
        cases={{
          home: () => <p>{constant('home')}</p>,
          products: () => <p>{constant('products')}</p>,
          'products.new': undefined,
          'products.item': undefined,
          settings: () => <p>{constant('settings')}</p>,
          drafts: undefined,
        }}
        pending={<p>{constant('checking')}</p>}
      />
    ));

    assert.strictEqual(container.textContent, 'checking');

    mut_check.settle(false);

    await nextTask();

    assert.strictEqual(container.textContent, 'home');

    unmount();

    router.dispose();
  });
});
