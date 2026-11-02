import {
  defineRoutes,
  hrefWithSearch,
  matchRoutes,
  search,
} from 'synstate-router';
import { asSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('hrefWithSearch', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      home: { segment: '' },
      products: {
        search: { page: search.int({ default: 1 }), q: search.string() },
      },
    });

    const m = matchRoutes(routes, {
      pathname: '/products/',
      search: 'q=shoe&page=3',
    });

    assert.isTrue(m.route === 'products');

    // The assertion narrows the match to the page.
    assert.strictEqual(
      hrefWithSearch(routes, m, { page: asSafeInt(1) }),
      '/products/?q=shoe',
    );

    // embed-sample-code-ignore-below
  });
}
