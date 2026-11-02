import { defineRoutes, param, search } from 'synstate-router';
import { asSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('defineRoutes', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      home: { segment: '' },
      products: {
        search: { page: search.int({ default: 1 }) },
        children: {
          item: { params: { productId: param.int } },
        },
      },
    });

    assert.strictEqual(routes.products.item.pattern, '/products/:productId');

    assert.strictEqual(
      routes.products.item.href({ productId: asSafeInt(42) }),
      '/products/42/',
    );

    assert.strictEqual(
      routes.products.href({ search: { page: asSafeInt(2) } }),
      '/products/?page=2',
    );

    // embed-sample-code-ignore-below
  });
}
