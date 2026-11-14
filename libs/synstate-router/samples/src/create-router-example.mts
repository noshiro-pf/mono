import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  param,
  search,
} from 'synstate-router';
import { asSafeInt, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('createRouter', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      home: { segment: '' },
      products: {
        search: { page: search.int({ default: 1 }) },
        children: { item: { params: { productId: param.int } } },
      },
    });

    const router = createRouter(routes, {
      browser: createMemoryBrowser('https://example.com/'),
    });

    router.push(routes.products.item.href({ productId: asSafeInt(42) }));

    const m = Optional.unwrap(router.match.getSnapshot());

    assert.isTrue(m.route === 'products.item' && m.params.productId === 42);

    router.dispose();

    // embed-sample-code-ignore-below
  });
}
