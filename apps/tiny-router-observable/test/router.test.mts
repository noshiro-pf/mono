// cspell:ignore unstub
import {
  createMemoryBrowser,
  createRouter,
  normalizeBasePath,
  prependBasePath,
  stripBasePath,
  type Router,
  type RouterState,
} from '../src/index.mjs';

describe(normalizeBasePath, () => {
  test.each([
    ['/', '/'],
    ['', '/'],
    ['/mono/profile/', '/mono/profile/'],
    ['/mono/profile', '/mono/profile/'],
    ['mono/profile/', '/mono/profile/'],
  ] as const)('%j becomes %j', (basePath, expected) => {
    expect(normalizeBasePath(basePath)).toBe(expected);
  });
});

describe(stripBasePath, () => {
  test.each([
    ['/mono/profile/', '/mono/profile/career/', '/career/'],
    ['/mono/profile/', '/mono/profile/', '/'],
    ['/mono/profile/', '/mono/profile', '/'],
    // Outside the base: there is nothing to strip, and inventing a path would
    // hide where the page really is.
    ['/mono/profile/', '/other/', '/other/'],
    // A directory whose name only begins with the base's last segment.
    ['/mono/profile/', '/mono/profile-old/', '/mono/profile-old/'],
    ['/', '/career/', '/career/'],
  ] as const)('below %j, %j is %j', (basePath, pathname, expected) => {
    expect(stripBasePath(basePath, pathname)).toBe(expected);
  });
});

describe(prependBasePath, () => {
  test.each([
    ['/mono/profile/', '/career/', '/mono/profile/career/'],
    ['/mono/profile/', '/', '/mono/profile/'],
    ['/mono/profile/', '/?a=1', '/mono/profile/?a=1'],
    // A whole URL already says where it goes.
    [
      '/mono/profile/',
      'https://example.com/career/',
      'https://example.com/career/',
    ],
    ['/mono/profile/', '//example.com/career/', '//example.com/career/'],
    ['/', '/career/', '/career/'],
  ] as const)('below %j, %j is %j', (basePath, path, expected) => {
    expect(prependBasePath(basePath, path)).toBe(expected);
  });
});

describe(createRouter, () => {
  test('without a base path, the pathname is the whole one', () => {
    const browser = createMemoryBrowser('https://example.com/career/');

    const router = createRouter({ browser });

    expect(stateOf(router).pathname).toBe('/career/');

    router.push('/skills');

    expect(browser.url().pathname).toBe('/skills/');

    expect(stateOf(router).pathname).toBe('/skills/');
  });

  test('the state shows the pathname below the base path', () => {
    const browser = createMemoryBrowser(
      'https://example.com/mono/profile/career/',
    );

    const router = createRouter({ basePath: '/mono/profile/', browser });

    expect(stateOf(router).pathname).toBe('/career/');

    expect(stateOf(router).pathSegments).toStrictEqual(['career']);
  });

  test('push and redirect put a root-relative path below the base path', () => {
    const browser = createMemoryBrowser('https://example.com/mono/profile/');

    const router = createRouter({ basePath: '/mono/profile/', browser });

    router.push('/skills/');

    expect(browser.url().pathname).toBe('/mono/profile/skills/');

    expect(stateOf(router).pathname).toBe('/skills/');

    router.redirect('/career');

    expect(browser.url().pathname).toBe('/mono/profile/career/');

    expect(stateOf(router).pathname).toBe('/career/');
  });

  test('a query string pushed to the root stays on the page', () => {
    const browser = createMemoryBrowser('https://example.com/mono/loan/');

    const router = createRouter({ basePath: '/mono/loan/', browser });

    router.push('/?a=1');

    expect(browser.url().href).toBe('https://example.com/mono/loan/?a=1');

    expect(stateOf(router).pathname).toBe('/');

    expect(stateOf(router).searchParams.get('a')).toBe('1');
  });

  test('updateQueryParams keeps the base path', () => {
    const browser = createMemoryBrowser('https://example.com/mono/loan/?b=2');

    const router = createRouter({ basePath: '/mono/loan/', browser });

    router.updateQueryParams((draft) => {
      draft.set('a', '1');

      return draft;
    });

    expect(browser.url().href).toBe('https://example.com/mono/loan/?a=1&b=2');
  });

  test('the redirect option reads and writes paths below the base path', () => {
    const browser = createMemoryBrowser('https://example.com/mono/profile/');

    const redirect = vi.fn((pathname: string) =>
      pathname === '/' ? '/career/' : undefined,
    );

    const router = createRouter({
      basePath: '/mono/profile/',
      redirect,
      browser,
    });

    expect(redirect).toHaveBeenCalledWith('/');

    expect(browser.url().pathname).toBe('/mono/profile/career/');

    expect(stateOf(router).pathname).toBe('/career/');
  });

  test('follows the history back and forward', () => {
    const browser = createMemoryBrowser('https://example.com/');

    const router = createRouter({ browser });

    router.push('/a/');

    router.push('/b/');

    router.back();

    expect(stateOf(router).pathname).toBe('/a/');

    router.go(-1);

    expect(stateOf(router).pathname).toBe('/');

    router.forward();

    expect(stateOf(router).pathname).toBe('/a/');
  });

  test('follows a move through the history it did not make, until the listener is removed', () => {
    const browser = createMemoryBrowser('https://example.com/');

    const router = createRouter({ browser });

    router.push('/a/');

    browser.history.back();

    expect(stateOf(router).pathname).toBe('/');

    router.removeListener();

    browser.history.forward();

    expect(stateOf(router).pathname).toBe('/');
  });

  test('without a browser, routes the real window', () => {
    const currentUrl = openAt('https://example.com/career/');

    const router = createRouter();

    try {
      expect(stateOf(router).pathname).toBe('/career/');

      router.push('/skills');

      expect(currentUrl().pathname).toBe('/skills/');

      expect(stateOf(router).pathname).toBe('/skills/');
    } finally {
      router.removeListener();

      vi.unstubAllGlobals();
    }
  });
});

describe(createMemoryBrowser, () => {
  test('a push drops the entries ahead of the current one', () => {
    const browser = createMemoryBrowser('https://example.com/');

    browser.history.pushState({}, '', '/a/');

    browser.history.pushState({}, '', '/b/');

    browser.history.back();

    browser.history.pushState({}, '', '/c/');

    browser.history.forward();

    expect(browser.url().pathname).toBe('/c/');

    browser.history.back();

    expect(browser.url().pathname).toBe('/a/');
  });

  test('a replace changes the current entry only', () => {
    const browser = createMemoryBrowser('https://example.com/');

    browser.history.pushState({}, '', '/a/');

    browser.history.replaceState({}, '', '/b/');

    expect(browser.url().pathname).toBe('/b/');

    browser.history.back();

    expect(browser.url().pathname).toBe('/');
  });

  test('fires popstate only when the entry changes', () => {
    const browser = createMemoryBrowser('https://example.com/');

    const listener = vi.fn();

    browser.addEventListener('popstate', listener);

    browser.history.back();

    expect(listener).not.toHaveBeenCalled();

    browser.history.pushState({}, '', '/a/');

    browser.history.back();

    expect(listener).toHaveBeenCalledOnce();
  });
});

/**
 * Stands in for the browser's globals: just the location and the history
 * methods the router calls, with each URL resolved against the current one as
 * `history.pushState` does. Returns a reader of the current URL.
 *
 * The location is stubbed both on its own and on `window`, because the router
 * reads it as `globalThis.location` (a worker has one too) and the history as
 * `window.history` (only a window has one).
 */
const openAt = (href: string): (() => URL) => {
  const mut_current = { url: new URL(href) };

  const navigate = (
    _state: unknown,
    _unused: string,
    url?: string | null,
  ): void => {
    if (url !== undefined && url !== null) {
      mut_current.url = new URL(url, mut_current.url);
    }
  };

  const location = {
    get href() {
      return mut_current.url.href;
    },
    get pathname() {
      return mut_current.url.pathname;
    },
  } as const;

  vi.stubGlobal('location', location);

  vi.stubGlobal('window', {
    location,
    history: {
      pushState: navigate,
      replaceState: navigate,
    },
  });

  vi.stubGlobal('addEventListener', vi.fn());

  vi.stubGlobal('removeEventListener', vi.fn());

  return () => mut_current.url;
};

const stateOf = (router: Router): RouterState =>
  router.state.getSnapshot().value;
