import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  handleLinkClick,
  type LinkClickEvent,
} from 'synstate-router';
import { Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('handleLinkClick', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({ home: { segment: '' }, about: {} });

    const router = createRouter(routes, {
      browser: createMemoryBrowser('https://example.com/'),
    });

    const click = (
      href: string,
      init?: Partial<LinkClickEvent>,
    ): Readonly<{ handled: boolean; prevented: boolean }> => {
      const mut_state = { prevented: false };

      const handled = handleLinkClick(router, {
        defaultPrevented: false,
        button: 0,
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        currentTarget: { href, target: '', hasAttribute: () => false },
        preventDefault: () => {
          mut_state.prevented = true;
        },
        ...init,
      });

      return { handled, prevented: mut_state.prevented };
    };

    // Ctrl+click opens a new tab: the browser's.
    assert.deepStrictEqual(
      click('https://example.com/about/', { ctrlKey: true }),
      { handled: false, prevented: false },
    );

    assert.deepStrictEqual(click('https://example.com/about/'), {
      handled: true,
      prevented: true,
    });

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'about',
    );

    // embed-sample-code-ignore-below
  });
}
