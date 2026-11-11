import { constant } from 'synstate-dom';
import { createMemoryBrowser, createRouter } from 'synstate-router';
import { createRouterComponents } from '../../src/index.mjs';
import { mountInto, nextTask, routes } from './fixture.js';

describe('Link viewTransition', () => {
  test('makes the navigation inside a View Transition, ended once Routes has drawn the page', async () => {
    const start = new URL('/', globalThis.location.origin);

    const browser = createMemoryBrowser(start.href, { viewTransitions: true });

    const router = createRouter(routes, { browser });

    const { Link, Routes } = createRouterComponents(router);

    const { container, unmount } = mountInto(() => (
      <>
        <Link to={routes.settings.href()} viewTransition>
          {constant('go')}
        </Link>
        <Routes
          cases={{
            home: () => <p>{constant('home page')}</p>,
            products: () => <p>{constant('products')}</p>,
            'products.new': undefined,
            'products.item': undefined,
            settings: () => <p>{constant('settings page')}</p>,
            drafts: undefined,
          }}
        />
      </>
    ));

    const link = container.querySelector('a');

    assert.isNotNull(link);

    link.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
    );

    assert.include(container.textContent, 'home page');

    await nextTask();

    await Promise.resolve();

    assert.include(container.textContent, 'settings page');

    assert.deepStrictEqual(browser.viewTransitions(), ['finished']);

    unmount();

    router.dispose();
  });
});
