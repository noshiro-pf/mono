import { asSafeInt } from 'ts-data-forge';
import {
  defineRoutes,
  hrefWithSearch,
  matchRoutes,
  param,
  search,
  type PageMatch,
} from '../src/index.mjs';

const routes = defineRoutes({
  home: { segment: '' },
  products: {
    search: { page: search.int({ default: 1 }), q: search.string() },
    children: {
      item: {
        params: { productId: param.int },
        search: { tab: search.string() },
      },
    },
  },
});

describe(hrefWithSearch, () => {
  test('keeps the params of a nested page and lays the patch over its search', () => {
    const m = matchRoutes(routes, {
      pathname: '/products/7/',
      search: 'tab=reviews&page=2',
    });

    assert.isTrue(m.route === 'products.item');

    assert.strictEqual(
      hrefWithSearch(routes, m, { tab: 'specs' }),
      '/products/7/?page=2&tab=specs',
    );

    assert.strictEqual(
      hrefWithSearch(routes, m, { tab: undefined, page: asSafeInt(1) }),
      '/products/7/',
    );
  });

  test('throws on a match of another route tree', () => {
    const other = defineRoutes({ about: {} });

    const m = matchRoutes(other, { pathname: '/about/', search: '' });

    assert.isTrue(m.route === 'about');

    assert.throws(
      () =>
        hrefWithSearch(
          routes,
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the mistake under test
          m as unknown as PageMatch<typeof routes>,
          {},
        ),
      'synstate-router: hrefWithSearch: about is not a page of these routes',
    );
  });
});
