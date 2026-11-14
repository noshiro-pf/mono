import { asSafeInt, Optional } from 'ts-data-forge';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  maxRedirects,
  param,
  type Href,
  type RouteMatch,
} from '../src/index.mjs';

const routes = defineRoutes({
  home: { segment: '' },
  account: {},
  signIn: { segment: 'sign-in' },
  item: { params: { id: param.int } },
});

type Routes = typeof routes;

const nextTask = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

/** A session check the test settles by hand. */
const deferred = (): Readonly<{
  promise: Promise<boolean>;
  settle: (signedIn: boolean) => void;
  fail: () => void;
}> => {
  const mut_hooks: { settle: (signedIn: boolean) => void; fail: () => void } = {
    settle: () => {},
    fail: () => {},
  };

  const promise = new Promise<boolean>((resolve, reject) => {
    mut_hooks.settle = resolve;

    mut_hooks.fail = () => {
      reject(new Error('session service down'));
    };
  });

  return {
    promise,
    settle: (signedIn) => {
      mut_hooks.settle(signedIn);
    },
    fail: () => {
      mut_hooks.fail();
    },
  };
};

const guarded = (
  url: string,
  check: () => Promise<boolean>,
): Readonly<{
  router: ReturnType<typeof createRouter<Routes>>;
  browser: ReturnType<typeof createMemoryBrowser>;
}> => {
  const browser = createMemoryBrowser(url);

  const router = createRouter(routes, {
    browser,
    redirect: async (m) =>
      m.route !== 'account' || (await check())
        ? undefined
        : routes.signIn.href(),
  });

  return { router, browser };
};

const route = (
  router: ReturnType<typeof createRouter<Routes>>,
): string | undefined => Optional.unwrap(router.match.getSnapshot()).route;

describe('an async redirect', () => {
  test('on the first load, the router is not ready until it settles, and no page is shown in between', async () => {
    const session = deferred();

    const { router, browser } = guarded(
      'https://example.com/account/',
      async () => session.promise,
    );

    assert.isFalse(Optional.unwrap(router.ready.getSnapshot()));

    assert.isTrue(Optional.unwrap(router.pending.getSnapshot()));

    session.settle(false);

    await nextTask();

    assert.isTrue(Optional.unwrap(router.ready.getSnapshot()));

    assert.isFalse(Optional.unwrap(router.pending.getSnapshot()));

    assert.strictEqual(route(router), 'signIn');

    assert.strictEqual(browser.url().pathname, '/sign-in/');

    router.dispose();
  });

  test('the title of a page that may redirect is not shown before the router is ready', async () => {
    const session = deferred();

    const browser = createMemoryBrowser('https://example.com/account/', {
      title: 'App',
    });

    const titled = defineRoutes({
      account: { meta: { title: 'Account' } },
      signIn: { segment: 'sign-in', meta: { title: 'Sign in' } },
    });

    const router = createRouter(titled, {
      browser,
      redirect: async (m) =>
        m.route === 'account' && !(await session.promise)
          ? titled.signIn.href()
          : undefined,
    });

    assert.strictEqual(browser.title(), 'App');

    session.settle(false);

    await nextTask();

    assert.strictEqual(browser.title(), 'Sign in');

    router.dispose();
  });

  test('a push keeps the previous page and writes nothing until it settles', async () => {
    const session = deferred();

    const { router, browser } = guarded(
      'https://example.com/',
      async () => session.promise,
    );

    // An `async` function answers later even for a page it lets through.
    await nextTask();

    assert.isTrue(Optional.unwrap(router.ready.getSnapshot()));

    const mut_seen: (string | undefined)[] = [];

    router.match.subscribe((m: RouteMatch<Routes>) => {
      mut_seen.push(m.route);
    });

    router.push(routes.account.href());

    assert.isTrue(Optional.unwrap(router.pending.getSnapshot()));

    assert.strictEqual(browser.url().pathname, '/');

    session.settle(true);

    await nextTask();

    assert.deepStrictEqual(mut_seen, ['home', 'account']);

    assert.strictEqual(browser.url().pathname, '/account/');

    assert.isFalse(Optional.unwrap(router.pending.getSnapshot()));

    router.back();

    await nextTask();

    assert.strictEqual(route(router), 'home');

    router.dispose();
  });

  test('a history move keeps the previous page until it settles', async () => {
    const mut_sessions: ReturnType<typeof deferred>[] = [];

    const { router, browser } = guarded(
      'https://example.com/account/',
      async () => {
        const session = deferred();

        mut_sessions.push(session);

        return session.promise;
      },
    );

    mut_sessions[0]?.settle(true);

    await nextTask();

    router.push(routes.home.href());

    router.back();

    await nextTask();

    // The browser is back at /account/; the page waits for the check.
    assert.strictEqual(browser.url().pathname, '/account/');

    assert.strictEqual(route(router), 'home');

    mut_sessions[1]?.settle(false);

    await nextTask();

    assert.strictEqual(route(router), 'signIn');

    assert.strictEqual(browser.url().pathname, '/sign-in/');

    router.dispose();
  });

  test('a later navigation wins, and the stale result is dropped with its signal aborted', async () => {
    const session = deferred();

    const mut_signals: AbortSignal[] = [];

    const browser = createMemoryBrowser('https://example.com/');

    const router = createRouter(routes, {
      browser,
      redirect: async (m, _location, { signal }) => {
        if (m.route !== 'account') {
          return undefined;
        }

        mut_signals.push(signal);

        return (await session.promise) ? undefined : routes.signIn.href();
      },
    });

    await nextTask();

    router.push(routes.account.href());

    router.push(routes.item.href({ id: asSafeInt(1) }));

    await nextTask();

    assert.strictEqual(route(router), 'item');

    assert.isTrue(mut_signals[0]?.aborted === true);

    assert.isFalse(Optional.unwrap(router.pending.getSnapshot()));

    session.settle(false);

    await nextTask();

    assert.strictEqual(route(router), 'item');

    assert.strictEqual(browser.url().pathname, '/1/');

    router.dispose();
  });

  test('a rejected check is reported, and the page is shown', async () => {
    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    try {
      const session = deferred();

      const { router } = guarded(
        'https://example.com/',
        async () => session.promise,
      );

      router.push(routes.account.href());

      session.fail();

      await nextTask();

      assert.strictEqual(route(router), 'account');

      expect(error).toHaveBeenCalledExactlyOnceWith(
        'synstate-router: redirect rejected at https://example.com/account/; the page is shown',
        expect.any(Error),
      );

      router.dispose();
    } finally {
      // cspell:disable-next-line
      vi.unstubAllGlobals();
    }
  });

  test('a chain of async redirects stops after the limit', async () => {
    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    try {
      const browser = createMemoryBrowser('https://example.com/0/');

      const router = createRouter(routes, {
        browser,
        // A Promise that settles in a later microtask, as a check would.
        redirect: (m): Promise<Href | undefined> =>
          Promise.resolve(
            m.route === 'item'
              ? routes.item.href({ id: asSafeInt(m.params.id + 1) })
              : undefined,
          ),
      });

      for (let mut_i = 0; mut_i <= maxRedirects; mut_i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await nextTask();
      }

      assert.strictEqual(browser.url().pathname, `/${maxRedirects}/`);

      expect(error).toHaveBeenCalledExactlyOnceWith(
        `synstate-router: stopped after ${maxRedirects} redirects in a row, at https://example.com/${maxRedirects}/ (next: https://example.com/${maxRedirects + 1}/)`,
      );

      router.dispose();
    } finally {
      // cspell:disable-next-line
      vi.unstubAllGlobals();
    }
  });

  test('dispose aborts a check still pending', () => {
    const session = deferred();

    const mut_signals: AbortSignal[] = [];

    const router = createRouter(routes, {
      browser: createMemoryBrowser('https://example.com/account/'),
      redirect: async (_m, _location, { signal }) => {
        mut_signals.push(signal);

        await session.promise;

        return undefined;
      },
    });

    router.dispose();

    assert.isTrue(mut_signals[0]?.aborted === true);
  });
});
