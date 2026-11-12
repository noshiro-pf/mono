import { act, fireEvent, render } from '@testing-library/react';
import { createMemoryBrowser, createRouter } from 'synstate-router';
import { createReactRouter } from '../../src/index.mjs';
import { nextTask, routes } from './fixture.js';

describe('Link viewTransition', () => {
  test('makes the navigation inside a View Transition, ended once Routes has drawn the page', async () => {
    const start = new URL('/', globalThis.location.origin);

    const browser = createMemoryBrowser(start.href, { viewTransitions: true });

    const router = createRouter(routes, { browser });

    const { Link, Routes } = createReactRouter(router);

    const view = render(
      <>
        <Link to={routes.settings.href()} viewTransition>
          {'go'}
        </Link>
        <Routes
          cases={{
            home: () => 'home page',
            products: () => 'products',
            'products.new': undefined,
            'products.item': undefined,
            settings: () => 'settings page',
            drafts: undefined,
          }}
        />
      </>,
    );

    act(() => {
      fireEvent.click(view.getByText('go'));
    });

    // The browser captures the page before it runs the update.
    assert.isNotNull(view.queryByText('home page'));

    await act(async () => {
      await nextTask();
    });

    assert.isNotNull(view.queryByText('settings page'));

    assert.deepStrictEqual(browser.viewTransitions(), ['finished']);

    view.unmount();

    router.dispose();
  });
});
