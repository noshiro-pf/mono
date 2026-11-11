import {
  defineRoutes,
  matchedBranch,
  matchRoutes,
  param,
} from 'synstate-router';

if (import.meta.vitest !== undefined) {
  test('matchedBranch', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      products: {
        meta: { label: 'Products' },
        children: {
          item: {
            params: { productId: param.int },
            meta: { label: 'Product' },
          },
        },
      },
    });

    const branch = matchedBranch(
      routes,
      matchRoutes(routes, { pathname: '/products/42/' }),
    );

    assert.deepStrictEqual(
      branch.map(({ meta }) => meta.label),
      ['Products', 'Product'],
    );

    assert.deepStrictEqual<readonly (string | undefined)[]>(
      branch.map(({ href }) => href),
      ['/products/', '/products/42/'],
    );

    // embed-sample-code-ignore-below
  });
}
