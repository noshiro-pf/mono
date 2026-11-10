import { expectType, hasKey, isRecord, Optional } from 'ts-data-forge';
import type { RelaxedExtract } from 'ts-type-forge';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  historyState,
  matchRoutes,
  pageValues,
  search,
  type RouteMatch,
  type StandardSchemaV1,
} from '../src/index.mjs';

type Step = Readonly<{ step: number }>;

const stepState = historyState.custom<Step>({
  decode: (raw) =>
    isRecord(raw) && typeof raw['step'] === 'number'
      ? Optional.some({ step: raw['step'] })
      : Optional.none,
  encode: (value) => ({ step: value.step }),
});

const routes = defineRoutes({
  home: { segment: '' },
  checkout: {
    state: stepState,
    search: { coupon: search.string() },
  },
  settings: {},
  signIn: { segment: 'sign-in' },
});

type Routes = typeof routes;

const nextTask = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

const setup = (
  url: string = 'https://example.com/',
): Readonly<{
  router: ReturnType<typeof createRouter<Routes>>;
  browser: ReturnType<typeof createMemoryBrowser>;
}> => {
  const browser = createMemoryBrowser(url);

  return {
    browser,
    router: createRouter(routes, {
      browser,
      redirect: (m) =>
        m.route === 'settings' ? routes.signIn.href() : undefined,
    }),
  };
};

const current = (
  router: ReturnType<typeof createRouter<Routes>>,
): RouteMatch<Routes> => router.match.getSnapshot().value;

describe('history state', () => {
  test('is typed on the page that declares it, and absent from the others', () => {
    type Checkout = RelaxedExtract<
      RouteMatch<Routes>,
      Readonly<{ route: 'checkout' }>
    >;

    expectType<Checkout['state'], Step | undefined>('=');

    type Home = RelaxedExtract<RouteMatch<Routes>, Readonly<{ route: 'home' }>>;

    expectType<keyof Home, 'params' | 'route' | 'search'>('=');
  });

  test('travels with a push, next to the Href, and is read back typed', () => {
    const { router, browser } = setup();

    router.push(routes.checkout.href(), { state: { step: 2 } });

    const m = current(router);

    assert.isTrue(m.route === 'checkout');

    assert.deepStrictEqual(m.state, { step: 2 });

    // Never in the URL.
    assert.strictEqual(browser.url().href, 'https://example.com/checkout/');

    // Next to the entry's position, which the router keeps there.
    assert.deepStrictEqual(browser.history.state, {
      synstateRouterIndex: 1,
      state: { step: 2 },
    });
  });

  test('is restored by back and forward', async () => {
    const { router } = setup();

    router.push(routes.checkout.href(), { state: { step: 1 } });

    router.push(routes.checkout.href({ search: { coupon: 'x' } }), {
      state: { step: 2 },
    });

    router.push(routes.home.href());

    router.back();

    await nextTask();

    assert.deepStrictEqual<unknown>(current(router), {
      route: 'checkout',
      params: {},
      search: { coupon: 'x' },
      state: { step: 2 },
    });

    router.back();

    await nextTask();

    const m = current(router);

    assert.isTrue(m.route === 'checkout');

    assert.deepStrictEqual(m.state, { step: 1 });
  });

  test('is absent when the entry has none, or it does not decode', () => {
    const { router } = setup();

    router.push(routes.checkout.href());

    const without = current(router);

    assert.isTrue(without.route === 'checkout');

    assert.isUndefined(without.state);

    router.dispose();

    // An entry written by something other than the router.
    const browser = createMemoryBrowser('https://example.com/checkout/');

    browser.history.replaceState({ step: 'three' }, '', '/checkout/');

    const other = createRouter(routes, { browser });

    const junk = other.match.getSnapshot().value;

    assert.isTrue(junk.route === 'checkout');

    assert.isUndefined(junk.state);

    other.dispose();
  });

  test('is read from the entry the document was loaded at', () => {
    const browser = createMemoryBrowser('https://example.com/checkout');

    browser.history.replaceState({ step: 7 }, '', '/checkout');

    const router = createRouter(routes, { browser });

    const m = router.match.getSnapshot().value;

    assert.isTrue(m.route === 'checkout');

    assert.deepStrictEqual(m.state, { step: 7 });

    // Canonicalizing the URL keeps the entry's state.
    assert.strictEqual(browser.url().pathname, '/checkout/');

    assert.deepStrictEqual(browser.history.state, {
      synstateRouterIndex: 0,
      state: { step: 7 },
    });

    router.dispose();
  });

  test('a replace to the same URL with another state passes the new state on', () => {
    const { router } = setup();

    router.push(routes.checkout.href(), { state: { step: 1 } });

    router.replace(routes.checkout.href(), { state: { step: 2 } });

    const m = current(router);

    assert.isTrue(m.route === 'checkout');

    assert.deepStrictEqual(m.state, { step: 2 });
  });

  test('is kept by setSearch, and not by a replace without one', () => {
    const { router } = setup();

    router.push(routes.checkout.href(), { state: { step: 4 } });

    router.setSearch(routes.checkout, () => ({ coupon: 'y' }));

    assert.deepStrictEqual<unknown>(current(router), {
      route: 'checkout',
      params: {},
      search: { coupon: 'y' },
      state: { step: 4 },
    });

    router.replace(routes.checkout.href());

    const replaced = current(router);

    assert.isTrue(replaced.route === 'checkout');

    assert.isUndefined(replaced.state);
  });

  test('is not written for a page that declares none, nor across a redirect', () => {
    const { router, browser } = setup();

    router.push(routes.home.href({ hash: 'x' }), { state: { step: 1 } });

    assert.isNull(Reflect.get(browser.history.state ?? {}, 'state'));

    router.push(routes.settings.href(), { state: { step: 1 } });

    assert.strictEqual(current(router).route, 'signIn');

    assert.isNull(Reflect.get(browser.history.state ?? {}, 'state'));
  });

  test("a page's values carry its state, for a binding's case", () => {
    const m = matchRoutes(routes, {
      pathname: '/checkout/',
      state: { step: 6 },
    });

    assert.isTrue(m.route === 'checkout');

    const values = pageValues(routes, m);

    expectType<typeof values.state, Step | undefined>('=');

    assert.deepStrictEqual(values.state, { step: 6 });

    const home = matchRoutes(routes, { pathname: '/' });

    assert.isTrue(home.route === 'home');

    assert.isFalse(hasKey(pageValues(routes, home), 'state'));
  });

  test('a fragment push with a state, on a page that declares none, stays a fragment navigation', () => {
    const { router, browser } = setup();

    router.push(routes.home.href({ hash: 'top' }), { state: { step: 1 } });

    // The browser's own fragment navigation scrolls; the router's would not.
    assert.deepStrictEqual(browser.scrolls(), ['#top']);
  });

  test('a state that does not read back is warned about in development', () => {
    const warn = vi.fn();

    vi.stubGlobal('console', { ...console, warn });

    try {
      const { router } = setup();

      router.push(routes.checkout.href(), { state: 'not a step' });

      const m = current(router);

      assert.isTrue(m.route === 'checkout');

      assert.isUndefined(m.state);

      expect(warn).toHaveBeenCalledExactlyOnceWith(
        'synstate-router: checkout: the state given does not read back through its codec, and is read as absent',
      );
    } finally {
      // cspell:disable-next-line
      vi.unstubAllGlobals();
    }
  });

  test('matchRoutes reads a raw state given with the location', () => {
    const m = matchRoutes(routes, {
      pathname: '/checkout/',
      state: { step: 5 },
    });

    assert.isTrue(m.route === 'checkout');

    assert.deepStrictEqual(m.state, { step: 5 });
  });
});

describe('historyState.schema', () => {
  test('reads the state through a Standard Schema, synchronously', () => {
    const schema: StandardSchemaV1<unknown, number> = {
      '~standard': {
        version: 1,
        vendor: 'test',
        validate: (value) =>
          typeof value === 'number'
            ? ({ value } as const)
            : ({ issues: [{ message: 'not a number' }] } as const),
      },
    } as const;

    const codec = historyState.schema(schema);

    assert.deepStrictEqual(codec.decode(3), Optional.some(3));

    assert.deepStrictEqual(codec.decode('3'), Optional.none);

    assert.strictEqual(codec.encode(3), 3);
  });
});
