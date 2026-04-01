/* eslint-disable functional/immutable-data */
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import { createRouter } from './create-router.mjs';
import { defineRoutes, param } from './define-routes.mjs';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const isBrowser = globalThis.window?.document !== undefined;

/**
 * Minimal window/history mock for Node.js environment.
 * In a real browser, the real window is used directly.
 */
let mut_savedHref: string | undefined;

const setupWindowMock = (): void => {
  if (isBrowser) {
    mut_savedHref = globalThis.window.location.href;

    globalThis.window.history.replaceState(null, '', '/');

    return;
  }

  let mut_href = 'http://localhost/';

  const mut_listeners = new Map<string, Set<() => void>>();

  (globalThis as Record<string, unknown>)['window'] = {
    get location() {
      return { href: mut_href };
    },
    history: {
      pushState: (_state: unknown, _title: string, url: string): void => {
        mut_href = new URL(url, mut_href).href;
      },
      replaceState: (_state: unknown, _title: string, url: string): void => {
        mut_href = new URL(url, mut_href).href;
      },
      back: (): void => {},
      forward: (): void => {},
      go: (_delta?: number): void => {},
    },
    addEventListener: (event: string, handler: () => void): void => {
      if (!mut_listeners.has(event)) {
        mut_listeners.set(event, new Set());
      }

      mut_listeners.get(event)?.add(handler);
    },
    removeEventListener: (event: string, handler: () => void): void => {
      mut_listeners.get(event)?.delete(handler);
    },
  };
};

const teardownWindowMock = (): void => {
  if (isBrowser) {
    if (mut_savedHref !== undefined) {
      globalThis.window.history.replaceState(null, '', mut_savedHref);
    }

    return;
  }

  (globalThis as Record<string, unknown>)['window'] = undefined;
};

describe('createRouter', () => {
  const routes = defineRoutes({
    products: {
      queryParams: {
        page: param.query.number({ default: 1 }),
        filter: param.query.string(),
      },
      children: {
        item: {
          params: { productId: param.path.string },
        },
      },
    },
    settings: {},
  });

  // eslint-disable-next-line vitest/no-hooks
  beforeEach(() => {
    setupWindowMock();
  });

  // eslint-disable-next-line vitest/no-hooks
  afterEach(() => {
    teardownWindowMock();
  });

  describe('state', () => {
    test('state is an InitializedObservable', () => {
      const router = createRouter(routes);

      assert.isDefined(router.state);

      assert.isDefined(router.state.subscribe);

      assert.isDefined(router.state.getSnapshot);

      router.dispose();
    });

    test('state snapshot contains pathname, pathSegments, searchParams', () => {
      const router = createRouter(routes);

      const snapshot = router.state.getSnapshot();

      assert.isDefined(snapshot);

      assert.isTrue(isRecord(snapshot) && hasKey(snapshot, 'value'));

      const state = snapshot.value;

      assert.typeOf(state.pathname, 'string');

      assert.isTrue(Arr.isArray(state.pathSegments));

      assert.isDefined(state.searchParams);

      router.dispose();
    });
  });

  describe('navigation', () => {
    test('push updates state', () => {
      const router = createRouter(routes);

      const mut_history: string[] = [];

      router.state.subscribe((state) => {
        mut_history.push(state.pathname);
      });

      router.push('/products/123');

      assert.isTrue(Arr.isArrayAtLeastLength(mut_history, 2));

      assert.strictEqual(mut_history.at(-1), '/products/123');

      router.dispose();
    });

    test('redirect updates state via replaceState', () => {
      const router = createRouter(routes);

      const mut_history: string[] = [];

      router.state.subscribe((state) => {
        mut_history.push(state.pathname);
      });

      router.redirect('/settings');

      assert.strictEqual(mut_history.at(-1), '/settings');

      router.dispose();
    });
  });

  describe('getPathSegments', () => {
    test('returns current path segments synchronously', () => {
      const router = createRouter(routes);

      router.push('/products/123');

      const segments = router.getPathSegments();

      assert.deepStrictEqual(segments, ['products', '123']);

      router.dispose();
    });
  });

  describe('query params', () => {
    test('updateQueryParams modifies search params', () => {
      const router = createRouter(routes);

      router.push('/products');

      router.updateQueryParams((mut_params) => {
        mut_params.set('page', '2');
      });

      const state = router.state.getSnapshot().value;

      assert.strictEqual(state.searchParams.get('page'), '2');

      router.dispose();
    });

    test('updateQueryParams with replaceState', () => {
      const router = createRouter(routes);

      router.push('/products');

      router.updateQueryParams(
        (mut_params) => {
          mut_params.set('filter', 'active');
        },
        { method: 'replaceState' },
      );

      const state = router.state.getSnapshot().value;

      assert.strictEqual(state.searchParams.get('filter'), 'active');

      router.dispose();
    });

    test('setQueryParam sets a typed query param', () => {
      const router = createRouter(routes);

      router.push('/products');

      router.setQueryParam(routes.products.queryParams.page, 3);

      const state = router.state.getSnapshot().value;

      assert.strictEqual(state.searchParams.get('page'), '3');

      router.dispose();
    });

    test('deleteQueryParam removes a query param', () => {
      const router = createRouter(routes);

      router.push('/products?page=5');

      router.deleteQueryParam(routes.products.queryParams.page);

      const state = router.state.getSnapshot().value;

      assert.strictEqual(state.searchParams.get('page'), null);

      router.dispose();
    });

    test('getQueryParam reads typed value', () => {
      const router = createRouter(routes);

      router.push('/products?page=7');

      const page = router.getQueryParam(routes.products.queryParams.page);

      assert.strictEqual(page, 7);

      router.dispose();
    });

    test('getQueryParam returns default when param is missing', () => {
      const router = createRouter(routes);

      router.push('/products');

      const page = router.getQueryParam(routes.products.queryParams.page);

      assert.strictEqual(page, 1);

      router.dispose();
    });
  });
});
