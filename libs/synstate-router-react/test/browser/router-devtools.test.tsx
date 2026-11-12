import { act, render } from '@testing-library/react';
import { createMemoryBrowser, createRouter } from 'synstate-router';
import { RouterDevtools } from '../../src/index.mjs';
import { routes } from './fixture.js';

describe(RouterDevtools, () => {
  test('shows the location, the match, the route tree with the branch marked, and the last redirects', () => {
    const start = new URL('/drafts/', globalThis.location.origin);

    const router = createRouter(routes, {
      browser: createMemoryBrowser(start.href),
      redirect: (m) =>
        m.route === 'drafts' ? routes.settings.href() : undefined,
    });

    const view = render(<RouterDevtools router={router} />);

    assert.isNotNull(view.queryByText('Router: settings'));

    assert.isNotNull(view.queryByText(`${start.origin}/settings/`));

    assert.isNotNull(view.queryByText('/products/:productId'));

    const current = view.container.querySelector('tr[aria-current="location"]');

    assert.include(current?.textContent, 'settings');

    assert.isNotNull(
      view.queryByText(`${start.origin}/drafts/ → ${start.origin}/settings/`),
    );

    act(() => {
      router.push(routes.home.href());
    });

    assert.isNotNull(view.queryByText('Router: home'));

    view.unmount();

    router.dispose();
  });
});
