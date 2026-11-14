import { createState } from 'synstate';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  param,
  search,
} from 'synstate-router';
import { asSafeInt, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('README: createRouter', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      home: { segment: '' },
      products: {
        search: { q: search.string() },
        children: { item: { params: { productId: param.int } } },
      },
      signIn: { segment: 'sign-in' },
      settings: {},
    });

    const [signedIn] = createState(false);

    const router = createRouter(routes, {
      basePath: '/shop/', // `import.meta.env.BASE_URL` in a Vite app
      browser: createMemoryBrowser('https://example.com/shop/'), // the window when left out
      // Applied before `match` shows a page, so no subscriber has to navigate.
      redirect: (m) =>
        m.route === 'settings' && !Optional.unwrap(signedIn.getSnapshot())
          ? routes.signIn.href()
          : undefined,
    });

    // `push` takes an `Href` only; `router.push('/settings/')` fails `tsc`.
    router.push(routes.settings.href());

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'signIn',
    );

    // The URL the browser shows, below the base path.
    assert.strictEqual(
      router.toUrl(routes.products.item.href({ productId: asSafeInt(42) })),
      '/shop/products/42/',
    );

    // Observables for layouts and navigation links.
    const inProducts = router.isActive(routes.products);

    router.push(routes.products.href());

    assert.isTrue(Optional.unwrap(inProducts.getSnapshot()));

    // Rewrites the search of a node, keeping the rest of the URL.
    router.setSearch(routes.products, (prev) => ({ ...prev, q: 'shoe' }));

    assert.deepStrictEqual(Optional.unwrap(router.match.getSnapshot()), {
      route: 'products',
      params: {},
      search: { q: 'shoe' },
    });

    // embed-sample-code-ignore-below
  });
}
