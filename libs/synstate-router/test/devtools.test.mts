import { Optional } from 'ts-data-forge';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  describeRoutes,
  maxRedirectRecords,
  param,
  search,
} from '../src/index.mjs';

const routes = defineRoutes({
  home: { segment: '' },
  products: {
    search: { page: search.int({ default: 1 }) },
    children: {
      item: {
        params: { productId: param.int },
        children: { reviews: { page: false, children: { all: {} } } },
      },
    },
  },
  old: { segment: 'old-home' },
});

describe(describeRoutes, () => {
  test('lists every node, parent first, with its pattern, params and search', () => {
    assert.deepStrictEqual(describeRoutes(routes), [
      { id: 'home', pattern: '/', params: [], search: [], page: true },
      {
        id: 'products',
        pattern: '/products',
        params: [],
        search: ['page'],
        page: true,
      },
      {
        id: 'products.item',
        pattern: '/products/:productId',
        params: ['productId'],
        search: ['page'],
        page: true,
      },
      {
        id: 'products.item.reviews',
        pattern: '/products/:productId/reviews',
        params: ['productId'],
        search: ['page'],
        page: false,
      },
      {
        id: 'products.item.reviews.all',
        pattern: '/products/:productId/reviews/all',
        params: ['productId'],
        search: ['page'],
        page: true,
      },
      { id: 'old', pattern: '/old-home', params: [], search: [], page: true },
    ]);
  });
});

describe('router.redirects', () => {
  test('keeps the redirects followed, newest last, up to a limit', () => {
    const router = createRouter(routes, {
      browser: createMemoryBrowser('https://example.com/old-home/'),
      redirect: (m) => (m.route === 'old' ? routes.home.href() : undefined),
    });

    assert.deepStrictEqual(Optional.unwrap(router.redirects.getSnapshot()), [
      { from: 'https://example.com/old-home/', to: 'https://example.com/' },
    ]);

    for (const _ of Array.from({ length: maxRedirectRecords + 2 })) {
      router.push(routes.old.href());
    }

    assert.strictEqual(
      Optional.unwrap(router.redirects.getSnapshot()).length,
      maxRedirectRecords,
    );

    router.dispose();
  });
});
