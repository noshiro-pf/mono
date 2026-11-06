import { createScope, createState, type InitializedObservable } from 'synstate';
import { asSafeInt, expectType, Optional, type SafeInt } from 'ts-data-forge';
import type { RelaxedExtract } from 'ts-type-forge';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  maxRedirects,
  param,
  search,
  type Href,
  type RouteMatch,
  type RouterOptions,
} from '../src/index.mjs';

const routes = defineRoutes({
  home: { segment: '' },
  products: {
    search: {
      page: search.int({ default: 1 }),
      q: search.string(),
    },
    children: {
      item: { params: { productId: param.int } },
    },
  },
  settings: {},
  signIn: { segment: 'sign-in' },
});

type Routes = typeof routes;

const setup = (
  url: string = 'https://example.com/',
  options?: RouterOptions<Routes>,
): Readonly<{
  browser: ReturnType<typeof createMemoryBrowser>;
  router: ReturnType<typeof createRouter<Routes>>;
}> => {
  const browser = createMemoryBrowser(url);

  const router = createRouter(routes, { browser, ...options });

  return { browser, router };
};

const current = <A,>(observable: InitializedObservable<A>): A =>
  observable.getSnapshot().value;

/** A router whose document has only the ids given to `draw`. */
const setupDrawing = (
  url: string,
): Readonly<{
  router: ReturnType<typeof createRouter<Routes>>;
  browser: ReturnType<typeof createMemoryBrowser>;
  draw: (id: string) => void;
}> => {
  const mut_drawn = new Set<string>();

  const browser = createMemoryBrowser(url, {
    hasElement: (id) => mut_drawn.has(id),
  });

  const router = createRouter(routes, { browser });

  return {
    router,
    browser,
    draw: (id) => {
      mut_drawn.add(id);
    },
  };
};

/** Waits for a later task, where the memory browser fires `popstate`. */
const nextTask = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

const item = (productId: number): Href =>
  routes.products.item.href({ productId: asSafeInt(productId) });

describe(createRouter, () => {
  test('matches the URL it starts at', () => {
    const { router } = setup('https://example.com/products/42/?page=3');

    assert.deepStrictEqual<unknown>(current(router.match), {
      route: 'products.item',
      params: { productId: 42 },
      search: { page: 3, q: undefined },
    });

    expectType<
      typeof router.match,
      ReturnType<typeof createRouter<Routes>>['match']
    >('=');

    expectType<
      RelaxedExtract<RouteMatch<Routes>, { route: 'products.item' }>['params'],
      Readonly<{ productId: SafeInt }>
    >('=');
  });

  test('shows the location below the base path', () => {
    const { router } = setup('https://example.com/app/products/?x=1#top', {
      basePath: '/app',
    });

    const location = current(router.location);

    assert.strictEqual(location.pathname, '/products/');

    assert.strictEqual(location.search.get('x'), '1');

    assert.strictEqual(location.hash, '#top');

    assert.strictEqual(
      location.href,
      'https://example.com/app/products/?x=1#top',
    );

    assert.strictEqual(current(router.match).route, 'products');
  });

  test('matches nothing outside the base path', () => {
    const { router, browser } = setup('https://example.com/products', {
      basePath: '/app/',
    });

    assert.deepStrictEqual<unknown>(current(router.match), {
      route: undefined,
      pathname: '/products',
    });

    // Not rewritten: the router does not own it.
    assert.strictEqual(browser.url().pathname, '/products');
  });

  test('reads the base path without its trailing slash as the root', () => {
    const { router, browser } = setup('https://example.com/app', {
      basePath: '/app/',
    });

    assert.strictEqual(current(router.match).route, 'home');

    assert.strictEqual(browser.url().pathname, '/app/');
  });
});

describe('the URL', () => {
  test('the pathname // matches nothing', () => {
    const { router } = setup('https://example.com//');

    assert.isUndefined(current(router.match).route);
  });

  test('a pathname that begins with // stays on this origin', () => {
    const { router, browser } = setup('https://example.com//evil.example/x');

    assert.strictEqual(browser.url().origin, 'https://example.com');

    assert.strictEqual(
      current(router.location).href,
      'https://example.com//evil.example/x/',
    );

    assert.isUndefined(current(router.match).route);
  });

  test('a base path given as a whole URL is its path', () => {
    const { router } = setup('https://example.com/app/settings/', {
      basePath: 'https://cdn.example.com/app/',
    });

    assert.strictEqual(current(router.match).route, 'settings');
  });

  test('throws on a relative base path, which names no path', () => {
    assert.throws(
      () => setup('https://example.com/', { basePath: './' }),
      'synstate-router: basePath ./ is relative; pass the path the application is served under',
    );
  });

  test('a base path is percent-encoded, as the URL is', () => {
    const { router } = setup('https://example.com/my%20app/settings/', {
      basePath: '/my app/',
    });

    assert.strictEqual(current(router.match).route, 'settings');

    assert.strictEqual(router.toUrl(routes.home.href()), '/my%20app/');
  });

  test('a base path with a colon and no // is a path', () => {
    const { router } = setup('https://example.com/app:v2/settings/', {
      basePath: 'app:v2/',
    });

    assert.strictEqual(current(router.match).route, 'settings');
  });

  test('a base path with more than one leading slash is one path', () => {
    const { router, browser } = setup('https://example.com/app/', {
      basePath: '//app',
    });

    router.push(routes.settings.href());

    assert.strictEqual(browser.url().href, 'https://example.com/app/settings/');

    assert.strictEqual(router.toUrl(routes.settings.href()), '/app/settings/');
  });
});

describe('trailing slash', () => {
  test("rewrites the URL to end in a slash by default ('always')", () => {
    const { router, browser } = setup('https://example.com/products?q=a#h');

    assert.strictEqual(
      browser.url().href,
      'https://example.com/products/?q=a#h',
    );

    assert.strictEqual(current(router.location).pathname, '/products/');

    assert.strictEqual(current(router.match).route, 'products');
  });

  test("rewrites the URL to end without one for 'never'", () => {
    const { router, browser } = setup('https://example.com/products/42/', {
      trailingSlash: 'never',
    });

    assert.strictEqual(browser.url().pathname, '/products/42');

    assert.strictEqual(current(router.match).route, 'products.item');

    assert.strictEqual(router.toUrl(item(1)), '/products/1');

    assert.strictEqual(router.toUrl(routes.home.href()), '/');
  });

  test('rewrites a URL no route matches as well', () => {
    const { router, browser } = setup('https://example.com/nowhere');

    assert.strictEqual(browser.url().pathname, '/nowhere/');

    assert.deepStrictEqual<unknown>(current(router.match), {
      route: undefined,
      pathname: '/nowhere/',
    });
  });
});

describe('push and replace', () => {
  test('push adds a history entry and updates at once', async () => {
    const { router, browser } = setup();

    router.push(item(1));

    assert.strictEqual(current(router.match).route, 'products.item');

    router.back();

    await nextTask();

    assert.strictEqual(current(router.match).route, 'home');

    assert.strictEqual(browser.url().pathname, '/');
  });

  test('replace replaces the current entry', async () => {
    const { router } = setup();

    router.push(routes.settings.href());

    router.replace(item(1));

    router.back();

    await nextTask();

    assert.strictEqual(current(router.match).route, 'home');
  });

  test('push to the current URL replaces instead of adding an entry', async () => {
    const { router } = setup();

    router.push(routes.settings.href());

    router.push(routes.settings.href());

    router.back();

    await nextTask();

    assert.strictEqual(current(router.match).route, 'home');
  });

  test('a push that a redirect leads back to the current page replaces', async () => {
    const { router } = setup('https://example.com/', {
      redirect: (m) =>
        m.route === 'products' ? routes.settings.href() : undefined,
    });

    router.push(routes.settings.href());

    router.push(routes.products.href());

    assert.strictEqual(current(router.match).route, 'settings');

    router.back();

    await nextTask();

    assert.strictEqual(current(router.match).route, 'home');
  });

  test('a push to the current URL replaces even when a redirect leads elsewhere', async () => {
    const [signedIn, setSignedIn] = createState(true);

    const { router } = setup('https://example.com/', {
      redirect: (m) =>
        m.route === 'settings' && !signedIn.getSnapshot().value
          ? routes.signIn.href()
          : undefined,
    });

    router.push(routes.settings.href());

    setSignedIn(false);

    router.push(routes.settings.href());

    assert.strictEqual(current(router.match).route, 'signIn');

    router.back();

    await nextTask();

    assert.strictEqual(current(router.match).route, 'home');
  });

  test('writes the URL below the base path', () => {
    const { router, browser } = setup('https://example.com/app/', {
      basePath: '/app/',
    });

    router.push(item(7));

    assert.strictEqual(browser.url().pathname, '/app/products/7/');

    assert.strictEqual(router.toUrl(item(7)), '/app/products/7/');

    assert.strictEqual(current(router.location).pathname, '/products/7/');
  });
});

describe('history moves', () => {
  test('change the state only when popstate fires, in a later task', async () => {
    const { router } = setup();

    router.push(routes.settings.href());

    const mut_seen: (string | undefined)[] = [];

    router.match.subscribe((m) => {
      mut_seen.push(m.route);
    });

    router.back();

    assert.strictEqual(current(router.match).route, 'settings');

    // A microtask is not enough: a browser fires popstate in a later task.
    await Promise.resolve();

    assert.strictEqual(current(router.match).route, 'settings');

    await nextTask();

    assert.strictEqual(current(router.match).route, 'home');

    router.forward();

    await nextTask();

    router.go(-1);

    await nextTask();

    // No stale URL is passed on between the moves (#2912).
    assert.deepStrictEqual(mut_seen, ['settings', 'home', 'settings', 'home']);
  });

  test('a popstate after dispose changes nothing', async () => {
    const { router, browser } = setup();

    router.push(routes.settings.href());

    router.dispose();

    router.back();

    await nextTask();

    assert.strictEqual(browser.url().pathname, '/');

    assert.strictEqual(current(router.match).route, 'settings');
  });
});

describe('redirect', () => {
  test('applies before the first state, rewriting the URL', () => {
    const { router, browser } = setup('https://example.com/settings/', {
      redirect: (m) =>
        m.route === 'settings' ? routes.signIn.href() : undefined,
    });

    assert.strictEqual(current(router.match).route, 'signIn');

    assert.strictEqual(browser.url().pathname, '/sign-in/');
  });

  test('applies to a push, so the redirected page alone is passed on', () => {
    const { router, browser } = setup('https://example.com/', {
      redirect: (m) =>
        m.route === 'settings' ? routes.signIn.href() : undefined,
    });

    const mut_seen: (string | undefined)[] = [];

    router.match.subscribe((m) => {
      mut_seen.push(m.route);
    });

    router.push(routes.settings.href());

    assert.deepStrictEqual(mut_seen, ['home', 'signIn']);

    assert.strictEqual(browser.url().pathname, '/sign-in/');
  });

  test('applies to a history move', async () => {
    const [signedIn, setSignedIn] = createState(true);

    const { router } = setup('https://example.com/', {
      redirect: (m) =>
        m.route === 'settings' && !signedIn.getSnapshot().value
          ? routes.signIn.href()
          : undefined,
    });

    router.push(routes.settings.href());

    router.push(routes.home.href());

    setSignedIn(false);

    router.back();

    await nextTask();

    assert.strictEqual(current(router.match).route, 'signIn');
  });

  test('stops a chain after the limit and reports it', () => {
    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    try {
      const mut_calls: number[] = [];

      const { router, browser } = setup('https://example.com/products/0/', {
        redirect: (m) => {
          if (m.route !== 'products.item') {
            return undefined;
          }

          mut_calls.push(m.params.productId);

          return item(m.params.productId + 1);
        },
      });

      assert.strictEqual(mut_calls.length, maxRedirects + 1);

      assert.strictEqual(browser.url().pathname, `/products/${maxRedirects}/`);

      assert.deepStrictEqual<unknown>(current(router.match), {
        route: 'products.item',
        params: { productId: maxRedirects },
        search: { page: 1, q: undefined },
      });

      expect(error).toHaveBeenCalledExactlyOnceWith(
        `synstate-router: stopped after ${maxRedirects} redirects in a row, at https://example.com/products/${maxRedirects}/ (next: https://example.com/products/${maxRedirects + 1}/)`,
      );
    } finally {
      // cspell:disable-next-line
      vi.unstubAllGlobals();
    }
  });

  test('a redirect to where the location already is stays', () => {
    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    try {
      const { router } = setup('https://example.com/settings/', {
        redirect: (m) =>
          m.route === 'settings' ? routes.settings.href() : undefined,
      });

      assert.strictEqual(current(router.match).route, 'settings');

      expect(error).not.toHaveBeenCalled();
    } finally {
      // cspell:disable-next-line
      vi.unstubAllGlobals();
    }
  });
});

describe('match', () => {
  test('passes nothing on when only the hash or an undeclared query changes', () => {
    const { router } = setup('https://example.com/products/1/');

    const mut_seen: unknown[] = [];

    router.match.subscribe((m) => {
      mut_seen.push(m);
    });

    router.push(
      routes.products.item.href({ productId: asSafeInt(1) }, { hash: 'x' }),
    );

    router.replace(
      routes.products.item.href(
        { productId: asSafeInt(1) },
        { search: { page: asSafeInt(1) } },
      ),
    );

    assert.strictEqual(mut_seen.length, 1);
  });

  test('keeps the params object when only the search changes', () => {
    const { router } = setup('https://example.com/products/1/');

    const before = current(router.match);

    router.push(
      routes.products.item.href(
        { productId: asSafeInt(1) },
        { search: { page: asSafeInt(2) } },
      ),
    );

    const after = current(router.match);

    assert.notStrictEqual(after, before);

    assert.isTrue(
      before.route === 'products.item' &&
        after.route === 'products.item' &&
        before.params === after.params,
    );
  });
});

describe('at and isActive', () => {
  test('outlive the scope of their first caller', () => {
    const { router } = setup();

    const scope = createScope();

    scope.run(() => {
      router.at(routes.settings);

      router.isActive(routes.settings);
    });

    scope.dispose();

    router.push(routes.settings.href());

    assert.isTrue(Optional.isSome(current(router.at(routes.settings))));

    assert.isTrue(current(router.isActive(routes.settings)));
  });

  test('the router outlives the scope it was created in', () => {
    const scope = createScope();

    const { router } = scope.run(() => setup());

    const settings = router.at(routes.settings);

    scope.dispose();

    router.push(routes.settings.href());

    assert.strictEqual(current(router.match).route, 'settings');

    assert.strictEqual(current(router.location).pathname, '/settings/');

    assert.isTrue(Optional.isSome(current(settings)));
  });

  test('at is the node prefix match with its own params and search', () => {
    const { router } = setup('https://example.com/products/5/?q=shoe');

    const products = router.at(routes.products);

    const productItem = router.at(routes.products.item);

    expectType<
      typeof productItem,
      ReturnType<typeof router.at<typeof routes.products.item>>
    >('=');

    assert.deepStrictEqual<unknown>(
      current(products),
      Optional.some({
        params: {},
        search: { page: 1, q: 'shoe' },
      }),
    );

    assert.deepStrictEqual<unknown>(
      current(productItem),
      Optional.some({
        params: { productId: 5 },
        search: { page: 1, q: 'shoe' },
      }),
    );

    assert.isTrue(Optional.isNone(current(router.at(routes.settings))));

    router.push(routes.settings.href());

    assert.isTrue(Optional.isNone(current(products)));
  });

  test('at keeps its params when only the search changes', () => {
    const { router } = setup('https://example.com/products/5/');

    const productItem = router.at(routes.products.item);

    const before = current(productItem);

    router.setSearch(routes.products, (prev) => ({ ...prev, q: 'shoe' }));

    const after = current(productItem);

    assert.isTrue(
      Optional.isSome(before) &&
        Optional.isSome(after) &&
        before.value.params === after.value.params,
    );
  });

  test('isActive is a prefix match unless exact', () => {
    const { router } = setup('https://example.com/products/5/');

    assert.isTrue(current(router.isActive(routes.products)));

    assert.isFalse(current(router.isActive(routes.products, { exact: true })));

    assert.isTrue(
      current(router.isActive(routes.products.item, { exact: true })),
    );

    assert.isFalse(current(router.isActive(routes.settings)));
  });

  test('returns the same observable for the same node', () => {
    const { router } = setup();

    assert.strictEqual(router.at(routes.products), router.at(routes.products));

    assert.strictEqual(
      router.isActive(routes.products),
      router.isActive(routes.products),
    );

    assert.notStrictEqual(
      router.isActive(routes.products),
      router.isActive(routes.products, { exact: true }),
    );
  });

  test('throws on a node of another route tree', () => {
    const { router } = setup();

    const other = defineRoutes({ products: {} });

    assert.throws(
      () => router.at(other.products),
      'synstate-router: router.at: products is a node of another route tree',
    );
  });
});

describe('setSearch', () => {
  test('rewrites the declared keys, keeping the rest of the URL', () => {
    const { router, browser } = setup(
      'https://example.com/products/5/?utm=x&q=a#reviews',
    );

    assert.isTrue(
      router.setSearch(routes.products, (prev) => ({
        ...prev,
        page: asSafeInt(2),
      })),
    );

    assert.strictEqual(
      browser.url().href,
      'https://example.com/products/5/?utm=x&page=2&q=a#reviews',
    );

    assert.deepStrictEqual<unknown>(current(router.match), {
      route: 'products.item',
      params: { productId: 5 },
      search: { page: 2, q: 'a' },
    });
  });

  test('leaves out a value equal to its default, and an absent one', () => {
    const { router, browser } = setup(
      'https://example.com/products/?page=2&q=a',
    );

    router.setSearch(routes.products, () => ({
      page: asSafeInt(1),
      q: undefined,
    }));

    assert.strictEqual(browser.url().href, 'https://example.com/products/');
  });

  test('returns false and changes nothing where the node is not matched', () => {
    const { router, browser } = setup('https://example.com/settings/');

    assert.isFalse(
      router.setSearch(routes.products, (prev) => ({ ...prev, q: 'a' })),
    );

    assert.strictEqual(browser.url().pathname, '/settings/');
  });

  test('adds a history entry unless asked to replace', async () => {
    const { router } = setup('https://example.com/products/');

    router.setSearch(routes.products, (prev) => ({ ...prev, q: 'a' }));

    router.setSearch(routes.products, (prev) => ({ ...prev, q: 'b' }), {
      replace: true,
    });

    router.back();

    await nextTask();

    assert.deepStrictEqual<unknown>(current(router.match), {
      route: 'products',
      params: {},
      search: { page: 1, q: undefined },
    });
  });

  test('throws on a value href would throw on', () => {
    const { router } = setup('https://example.com/products/');

    assert.throws(
      () =>
        router.setSearch(routes.products, (prev) => ({
          ...prev,
          q: '\u{D83D}',
        })),
      'synstate-router: products.setSearch: search.q is not well-formed Unicode',
    );
  });
});

describe('scrolling', () => {
  test('a new path scrolls to the top after the page is drawn', async () => {
    const { router, browser } = setup();

    router.push(routes.settings.href());

    assert.deepStrictEqual(browser.scrolls(), []);

    await nextTask();

    assert.deepStrictEqual(browser.scrolls(), ['top']);
  });

  test('a hash scrolls to its element', async () => {
    const { router, browser } = setup();

    router.push(routes.settings.href({ hash: 'a b' }));

    await nextTask();

    assert.deepStrictEqual(browser.scrolls(), ['#a b']);
  });

  test('a URL with a hash scrolls to its element once the first page is drawn', async () => {
    // The browser's own scroll ran while the document had no such element.
    const { router, browser } = setup('https://example.com/settings/#a');

    assert.deepStrictEqual(browser.scrolls(), []);

    router.flushScroll();

    assert.deepStrictEqual(browser.scrolls(), ['#a']);

    await nextTask();

    assert.deepStrictEqual(browser.scrolls(), ['#a']);
  });

  test('a URL with a hash leaves a reload or back and forward to the browser', async () => {
    const browser = createMemoryBrowser('https://example.com/settings/#a', {
      restoresScroll: true,
    });

    const router = createRouter(routes, { browser });

    router.flushScroll();

    await nextTask();

    assert.deepStrictEqual(browser.scrolls(), []);
  });

  describe('a fragment the frame did not find', () => {
    test('is looked for once more by the next flushScroll', async () => {
      const { router, browser, draw } = setupDrawing(
        'https://example.com/settings/#a',
      );

      // The frame runs before the page is drawn.
      await nextTask();

      assert.deepStrictEqual(browser.scrolls(), []);

      draw('a');

      router.flushScroll();

      assert.deepStrictEqual(browser.scrolls(), ['#a']);

      router.flushScroll();

      assert.deepStrictEqual(browser.scrolls(), ['#a']);
    });

    test('is looked for once only', async () => {
      const { router, browser, draw } = setupDrawing(
        'https://example.com/settings/#a',
      );

      await nextTask();

      router.flushScroll();

      draw('a');

      router.flushScroll();

      assert.deepStrictEqual(browser.scrolls(), []);
    });

    test('is not looked for when flushScroll itself did not find it', async () => {
      const { router, browser, draw } = setupDrawing(
        'https://example.com/settings/#a',
      );

      router.flushScroll();

      draw('a');

      router.flushScroll();

      await nextTask();

      assert.deepStrictEqual(browser.scrolls(), []);
    });

    test('is still looked for after a replace to the same URL', async () => {
      const { router, browser, draw } = setupDrawing(
        'https://example.com/settings/#a',
      );

      await nextTask();

      router.replace(routes.settings.href({ hash: 'a' }));

      draw('a');

      router.flushScroll();

      assert.deepStrictEqual(browser.scrolls(), ['#a']);
    });

    test('is not looked for on another URL', async () => {
      const { router, browser, draw } = setupDrawing(
        'https://example.com/products/#a',
      );

      await nextTask();

      // Search alone: the router schedules no scroll of its own.
      router.setSearch(routes.products, (prev) => ({ ...prev, q: 'x' }));

      draw('a');

      router.flushScroll();

      assert.deepStrictEqual(browser.scrolls(), []);
    });

    test('is not looked for after back', async () => {
      const { router, browser, draw } = setupDrawing('https://example.com/');

      router.push(routes.settings.href({ hash: 'a' }));

      await nextTask();

      router.back();

      await nextTask();

      draw('a');

      router.flushScroll();

      assert.deepStrictEqual(browser.scrolls(), []);
    });

    test('is not looked for after leaving its URL and coming back', async () => {
      const { router, browser, draw } = setupDrawing(
        'https://example.com/settings/#a',
      );

      await nextTask();

      router.push(routes.home.href());

      await nextTask();

      router.back();

      await nextTask();

      draw('a');

      router.flushScroll();

      assert.deepStrictEqual(browser.scrolls(), ['top']);
    });

    test('is not looked for after a move away and back with no frame between', async () => {
      const { router, browser, draw } = setupDrawing(
        'https://example.com/settings/#a',
      );

      await nextTask();

      // A fragment navigation and a history move: neither queues a frame.
      router.push(routes.settings.href({ hash: 'b' }));

      router.back();

      await nextTask();

      assert.strictEqual(browser.url().hash, '#a');

      draw('a');

      router.flushScroll();

      assert.deepStrictEqual(browser.scrolls(), ['#b']);
    });

    test('is dropped by dispose', async () => {
      const { router, browser, draw } = setupDrawing(
        'https://example.com/settings/#a',
      );

      await nextTask();

      router.dispose();

      draw('a');

      router.flushScroll();

      assert.deepStrictEqual(browser.scrolls(), []);
    });
  });

  test('a URL without a hash does not scroll at first', async () => {
    const { browser } = setup('https://example.com/settings/');

    await nextTask();

    assert.deepStrictEqual(browser.scrolls(), []);
  });

  test('a change of the search alone does not scroll', async () => {
    const { router, browser } = setup('https://example.com/products/');

    router.push(routes.products.href({ search: { q: 'a' } }));

    router.setSearch(routes.products, (prev) => ({ ...prev, q: 'b' }));

    await nextTask();

    assert.deepStrictEqual(browser.scrolls(), []);
  });

  test('a change of the hash alone is a fragment navigation', async () => {
    const { router, browser } = setup('https://example.com/settings/');

    router.push(routes.settings.href({ hash: 'x' }));

    assert.strictEqual(browser.url().hash, '#x');

    assert.strictEqual(current(router.location).hash, '#x');

    // The browser scrolls, at once; the router schedules nothing.
    assert.deepStrictEqual(browser.scrolls(), ['#x']);

    await nextTask();

    assert.deepStrictEqual(browser.scrolls(), ['#x']);

    router.back();

    await nextTask();

    assert.strictEqual(browser.url().hash, '');
  });

  test('a fragment navigation points a scroll scheduled before it at the fragment', async () => {
    const { router, browser } = setup();

    router.push(routes.settings.href());

    router.push(routes.settings.href({ hash: 'x' }));

    // The browser scrolls at once, before the new page is drawn; the router
    // scrolls again once it is, instead of to the top.
    assert.deepStrictEqual(browser.scrolls(), ['#x']);

    await nextTask();

    assert.deepStrictEqual(browser.scrolls(), ['#x', '#x']);
  });

  test('several moves in one frame scroll once, for the last', async () => {
    const { router, browser } = setup();

    router.push(routes.settings.href());

    router.push(routes.products.href({ hash: 'list' }));

    await nextTask();

    assert.deepStrictEqual(browser.scrolls(), ['#list']);
  });
});

describe('flushScroll', () => {
  test('a navigation after a flush in the same frame queues no second frame', async () => {
    const memory = createMemoryBrowser('https://example.com/');

    const mut_frames = { queued: 0 };

    const router = createRouter(routes, {
      browser: {
        ...memory,
        afterRender: (callback) => {
          mut_frames.queued += 1;

          memory.afterRender(callback);
        },
      },
    });

    router.push(routes.settings.href());

    router.flushScroll();

    router.push(routes.products.href());

    assert.strictEqual(mut_frames.queued, 1);

    await nextTask();

    assert.deepStrictEqual(memory.scrolls(), ['top', 'top']);
  });

  test('makes the scheduled scroll at once, and the frame makes none', async () => {
    const { router, browser } = setup();

    router.push(routes.settings.href());

    router.flushScroll();

    assert.deepStrictEqual(browser.scrolls(), ['top']);

    await nextTask();

    assert.deepStrictEqual(browser.scrolls(), ['top']);
  });
});

describe('parseHref', () => {
  test('accepts a page of this application, below the base path', () => {
    const { router } = setup('https://example.com/app/', { basePath: '/app/' });

    assert.deepStrictEqual<unknown>(
      router.parseHref('https://example.com/app/products/3?page=2#r'),
      Optional.some('/products/3/?page=2#r'),
    );

    assert.deepStrictEqual<unknown>(
      router.parseHref('/app/settings/'),
      Optional.some('/settings/'),
    );
  });

  test('rejects another origin, a path outside the base, and no page', () => {
    const { router } = setup('https://example.com/app/', { basePath: '/app/' });

    assert.isTrue(
      Optional.isNone(router.parseHref('https://evil.example/app/settings/')),
    );

    assert.isTrue(Optional.isNone(router.parseHref('/settings/')));

    assert.isTrue(Optional.isNone(router.parseHref('/app/nowhere/')));

    assert.isTrue(Optional.isNone(router.parseHref('http://[')));
  });
});

describe('follow', () => {
  test('skips the value the observable holds when following starts', async () => {
    const { router } = setup('https://example.com/products/?q=shoe');

    const [href$] = createState<Href>(routes.products.href());

    router.follow(href$);

    await Promise.resolve();

    assert.strictEqual(current(router.location).search.get('q'), 'shoe');
  });

  test('follows nothing after dispose', async () => {
    const { router, browser } = setup();

    router.dispose();

    const [href$, setHref] = createState<Href>(routes.home.href());

    router.follow(href$);

    setHref(routes.settings.href());

    await Promise.resolve();

    assert.strictEqual(browser.url().pathname, '/');
  });

  test('outlives the scope it was started in, until stopped', async () => {
    const { router } = setup();

    const [href$, setHref] = createState<Href>(routes.home.href());

    const scope = createScope();

    const stopFollowing = scope.run(() => router.follow(href$));

    scope.dispose();

    setHref(routes.settings.href());

    await Promise.resolve();

    assert.strictEqual(current(router.match).route, 'settings');

    stopFollowing();
  });

  test('dispose stops following and drops a pending scroll', async () => {
    const { router, browser } = setup();

    const [href$, setHref] = createState<Href>(routes.home.href());

    router.follow(href$);

    router.push(routes.settings.href());

    router.dispose();

    setHref(routes.products.href());

    await nextTask();

    assert.strictEqual(browser.url().pathname, '/settings/');

    assert.deepStrictEqual(browser.scrolls(), []);
  });

  test('navigates to each Href after the update has propagated', async () => {
    const { router } = setup('https://example.com/products/');

    const [href$, setHref] = createState<Href>(routes.products.href());

    const stopFollowing = router.follow(href$, { replace: true });

    setHref(routes.products.href({ search: { q: 'a' } }));

    // Not yet: the write is still propagating.
    assert.deepStrictEqual<unknown>(current(router.match), {
      route: 'products',
      params: {},
      search: { page: 1, q: undefined },
    });

    await Promise.resolve();

    assert.deepStrictEqual<unknown>(current(router.match), {
      route: 'products',
      params: {},
      search: { page: 1, q: 'a' },
    });

    stopFollowing();

    setHref(routes.settings.href());

    await Promise.resolve();

    assert.strictEqual(current(router.match).route, 'products');
  });
});

// Never called: for the type checker.
const _routerMistakes = (
  r: ReturnType<typeof createRouter<Routes>>,
  path: string,
): void => {
  // @ts-expect-error A hand-written string is not an Href.
  r.push('/products/1/');

  // @ts-expect-error Nor is a string variable.
  r.replace(path);

  r.setSearch(routes.products, (prev) => ({
    ...prev,
    // @ts-expect-error The page is a SafeInt.
    page: '2',
  }));

  // @ts-expect-error `settings` declares no search.
  r.setSearch(routes.settings, (prev) => prev);
};

describe('router types', () => {
  test('take an Href and typed search only', () => {
    expectType<
      typeof _routerMistakes,
      (r: ReturnType<typeof createRouter<Routes>>, path: string) => void
    >('=');

    const { router } = setup('https://example.com/products/5/');

    const productItem = current(router.at(routes.products.item));

    if (Optional.isSome(productItem)) {
      expectType<typeof productItem.value.params.productId, SafeInt>('=');

      expectType<typeof productItem.value.search.q, string | undefined>('=');
    }

    assert.isTrue(Optional.isSome(productItem));
  });
});
