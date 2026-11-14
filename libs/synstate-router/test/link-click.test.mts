import { Optional } from 'ts-data-forge';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  handleLinkClick,
  type LinkClickEvent,
} from '../src/index.mjs';

const routes = defineRoutes({
  home: { segment: '' },
  about: {},
});

const setup = (
  url: string = 'https://example.com/app/',
): Readonly<{
  router: ReturnType<typeof createRouter<typeof routes>>;
  browser: ReturnType<typeof createMemoryBrowser>;
  click: (
    href: string,
    init?: Partial<LinkClickEvent>,
    options?: Readonly<{ replace?: boolean }>,
  ) => Readonly<{ handled: boolean; prevented: boolean }>;
}> => {
  const browser = createMemoryBrowser(url);

  const router = createRouter(routes, { basePath: '/app/', browser });

  const click = (
    href: string,
    init?: Partial<LinkClickEvent>,
    options?: Readonly<{ replace?: boolean }>,
  ): Readonly<{ handled: boolean; prevented: boolean }> => {
    const mut_state = { prevented: false };

    const handled = handleLinkClick(
      router,
      {
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
      },
      options,
    );

    return { handled, prevented: mut_state.prevented };
  };

  return { router, browser, click };
};

const anchor = (
  target: string,
  download: boolean,
): LinkClickEvent['currentTarget'] =>
  ({
    href: 'https://example.com/app/about/',
    target,
    hasAttribute: (name) => download && name === 'download',
  }) as const;

const ignored = { handled: false, prevented: false } as const;

const routed = { handled: true, prevented: true } as const;

describe(handleLinkClick, () => {
  test('routes a plain click on a page of this application', () => {
    const { router, browser, click } = setup();

    assert.deepStrictEqual(click('https://example.com/app/about/'), routed);

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'about',
    );

    assert.strictEqual(browser.url().pathname, '/app/about/');
  });

  test.each([
    ['metaKey', { metaKey: true }],
    ['ctrlKey', { ctrlKey: true }],
    ['shiftKey', { shiftKey: true }],
    ['altKey', { altKey: true }],
    ['a middle click', { button: 1 }],
    ['a click already handled', { defaultPrevented: true }],
  ] as const)('leaves %s to the browser', (_, init) => {
    const { click } = setup();

    assert.deepStrictEqual(
      click('https://example.com/app/about/', init),
      ignored,
    );
  });

  test('leaves a target other than _self, and a download, to the browser', () => {
    const { click } = setup();

    assert.deepStrictEqual(
      click('', { currentTarget: anchor('_blank', false) }),
      ignored,
    );

    assert.deepStrictEqual(
      click('', { currentTarget: anchor('', true) }),
      ignored,
    );

    assert.deepStrictEqual(
      click('', { currentTarget: anchor('_self', false) }),
      routed,
    );
  });

  test('leaves another origin, a path outside the base and no page to the browser', () => {
    const { click } = setup();

    assert.deepStrictEqual(click('https://other.example/app/about/'), ignored);

    assert.deepStrictEqual(click('https://example.com/about/'), ignored);

    assert.deepStrictEqual(click('https://example.com/app/nowhere/'), ignored);
  });

  test('makes a fragment of the current page a fragment navigation (#3033)', () => {
    const { browser, click } = setup('https://example.com/app/about/');

    assert.deepStrictEqual(
      click('https://example.com/app/about/#team'),
      routed,
    );

    assert.strictEqual(
      browser.url().href,
      'https://example.com/app/about/#team',
    );

    assert.deepStrictEqual(browser.scrolls(), ['#team']);

    // Another page's fragment is a route change.
    assert.deepStrictEqual(click('https://example.com/app/#team'), routed);
  });

  test('replaces the entry for a fragment link with replace, and scrolls to it', async () => {
    const { router, browser, click } = setup();

    click('https://example.com/app/about/');

    click('https://example.com/app/about/#team', {}, { replace: true });

    assert.strictEqual(browser.url().hash, '#team');

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    assert.strictEqual(browser.scrolls().at(-1), '#team');

    router.back();

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    // The fragment replaced the about page's entry, so back is home.
    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'home',
    );
  });

  test('points a scroll still pending at a fragment clicked in the same frame', async () => {
    const { browser, click } = setup('https://example.com/app/about/');

    // Scrolls to the top once the page is drawn.
    click('https://example.com/app/');

    click('https://example.com/app/#team');

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    assert.strictEqual(browser.scrolls().at(-1), '#team');

    assert.isFalse(browser.scrolls().includes('top'));
  });

  test('replaces the entry when asked, or when the URL is the current one (#2956)', async () => {
    const { router, click } = setup();

    click('https://example.com/app/about/');

    click('https://example.com/app/about/');

    router.back();

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'home',
    );

    click('https://example.com/app/about/', {}, { replace: true });

    router.back();

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    // The first entry was replaced, so there is none before it to go back to.
    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'about',
    );
  });
});
