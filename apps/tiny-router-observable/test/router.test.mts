// cspell:ignore unstub
import {
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
    // Outside the base: there is nothing to strip, and inventing a path
    // would hide where the page really is.
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
  let mut_router: Router | undefined;

  afterEach(() => {
    mut_router?.removeListener();

    mut_router = undefined;

    vi.unstubAllGlobals();
  });

  test('without a base path, the pathname is the whole one', () => {
    const currentUrl = openAt('https://example.com/career/');

    mut_router = createRouter();

    expect(stateOf(mut_router).pathname).toBe('/career/');

    mut_router.push('/skills');

    expect(currentUrl().pathname).toBe('/skills/');

    expect(stateOf(mut_router).pathname).toBe('/skills/');
  });

  test('the state shows the pathname below the base path', () => {
    openAt('https://example.com/mono/profile/career/');

    mut_router = createRouter({ basePath: '/mono/profile/' });

    expect(stateOf(mut_router).pathname).toBe('/career/');

    expect(stateOf(mut_router).pathSegments).toStrictEqual(['career']);
  });

  test('push and redirect put a root-relative path below the base path', () => {
    const currentUrl = openAt('https://example.com/mono/profile/');

    mut_router = createRouter({ basePath: '/mono/profile/' });

    mut_router.push('/skills/');

    expect(currentUrl().pathname).toBe('/mono/profile/skills/');

    expect(stateOf(mut_router).pathname).toBe('/skills/');

    mut_router.redirect('/career');

    expect(currentUrl().pathname).toBe('/mono/profile/career/');

    expect(stateOf(mut_router).pathname).toBe('/career/');
  });

  test('a query string pushed to the root stays on the page', () => {
    const currentUrl = openAt('https://example.com/mono/loan/');

    mut_router = createRouter({ basePath: '/mono/loan/' });

    mut_router.push('/?a=1');

    expect(currentUrl().href).toBe('https://example.com/mono/loan/?a=1');

    expect(stateOf(mut_router).pathname).toBe('/');

    expect(stateOf(mut_router).searchParams.get('a')).toBe('1');
  });

  test('updateQueryParams keeps the base path', () => {
    const currentUrl = openAt('https://example.com/mono/loan/?b=2');

    mut_router = createRouter({ basePath: '/mono/loan/' });

    mut_router.updateQueryParams((draft) => {
      draft.set('a', '1');

      return draft;
    });

    expect(currentUrl().href).toBe('https://example.com/mono/loan/?a=1&b=2');
  });

  test('the redirect option reads and writes paths below the base path', () => {
    const currentUrl = openAt('https://example.com/mono/profile/');

    const redirect = vi.fn((pathname: string) =>
      pathname === '/' ? '/career/' : undefined,
    );

    mut_router = createRouter({ basePath: '/mono/profile/', redirect });

    expect(redirect).toHaveBeenCalledWith('/');

    expect(currentUrl().pathname).toBe('/mono/profile/career/');

    expect(stateOf(mut_router).pathname).toBe('/career/');
  });
});

/**
 * Stands in for the browser's globals: just the location and the history
 * methods the router calls, with each URL resolved against the current one
 * as `history.pushState` does. Returns a reader of the current URL.
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
