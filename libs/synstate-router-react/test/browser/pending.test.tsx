import { act, render } from '@testing-library/react';
import { createMemoryBrowser, createRouter } from 'synstate-router';
import { createReactRouter } from '../../src/index.mjs';
import { nextTask, routes } from './fixture.js';

describe('Routes before the router is ready', () => {
  test('draws pending, not the page, until an async redirect settles', async () => {
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

    const { Routes } = createReactRouter(router);

    const view = render(
      <Routes
        cases={{
          home: () => 'home',
          products: () => 'products',
          'products.new': undefined,
          'products.item': undefined,
          settings: () => 'settings',
          drafts: undefined,
        }}
        pending="checking"
      />,
    );

    view.getByText('checking');

    assert.isNull(view.queryByText('settings'));

    await act(async () => {
      mut_check.settle(false);

      await nextTask();
    });

    view.getByText('home');

    view.unmount();

    router.dispose();
  });
});
