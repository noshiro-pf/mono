import { defineRoutes, matchRoutes, pageValues, search } from 'synstate-router';
import { asSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('pageValues', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      home: { segment: '' },
      products: { search: { page: search.int({ default: 1 }) } },
    });

    const m = matchRoutes(routes, { pathname: '/products/', search: 'page=3' });

    assert.isTrue(m.route === 'products');

    const values = pageValues(routes, m);

    assert.strictEqual(values.search.page, 3);

    assert.strictEqual(
      values.withSearch({ page: asSafeInt(4) }),
      '/products/?page=4',
    );

    // embed-sample-code-ignore-below
  });
}
