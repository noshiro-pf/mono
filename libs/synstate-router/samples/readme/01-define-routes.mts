import { defineRoutes, matchRoutes, param, search } from 'synstate-router';
import { asSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('README: defineRoutes', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      home: { segment: '' },
      products: {
        search: {
          page: search.int({ default: 1 }),
          q: search.string(),
        },
        children: {
          new: {}, // /products/new/ wins over /products/:productId/
          item: { params: { productId: param.int } },
        },
      },
    });

    // The only way to make an `Href` is a node's `href`.
    const href = routes.products.item.href(
      { productId: asSafeInt(42) },
      { search: { q: 'shoe' } },
    );

    assert.strictEqual(href, '/products/42/?q=shoe');

    const m = matchRoutes(routes, {
      pathname: '/products/42/',
      search: 'q=shoe',
    });

    switch (m.route) {
      case 'products.item':
        // `params` and `search` are narrowed to this route's types.
        assert.strictEqual(m.params.productId, 42);

        assert.strictEqual(m.search.page, 1);

        break;

      case 'home':
      case 'products':
      case 'products.new':
      case undefined:
        throw new Error(`unexpected ${m.route ?? 'not found'}`);
    }

    // embed-sample-code-ignore-below
  });
}
