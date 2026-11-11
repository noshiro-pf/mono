import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  param,
} from 'synstate-router';
import { Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('README: breadcrumbs', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      products: {
        meta: { label: 'Products' },
        children: {
          item: {
            params: { productId: param.int },
            meta: { label: 'Product' },
            children: { reviews: { meta: { label: 'Reviews' } } },
          },
        },
      },
    });

    const router = createRouter(routes, {
      browser: createMemoryBrowser('https://example.com/products/42/reviews/'),
    });

    // Root first, each with its own meta and the Href of its page.
    const crumbs = Optional.unwrap(router.branch.getSnapshot()).map(
      ({ meta, href }) => `${meta.label} ${href ?? ''}`,
    );

    assert.deepStrictEqual(crumbs, [
      'Products /products/',
      'Product /products/42/',
      'Reviews /products/42/reviews/',
    ]);

    // embed-sample-code-ignore-below
  });
}
