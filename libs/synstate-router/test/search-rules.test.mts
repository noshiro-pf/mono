import { asSafeInt, expectType, Optional } from 'ts-data-forge';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  matchRoutes,
  param,
  search,
} from '../src/index.mjs';

const routes = defineRoutes({
  products: {
    search: {
      q: search.string(),
      tags: search.array(search.string()),
      page: search.int({ default: 1 }),
    },
    children: {
      item: {
        params: { productId: param.int },
        search: {
          tab: search.literal(['spec', 'reviews'], { default: 'spec' }),
        },
      },
    },
  },
  orders: { search: { q: search.string() } },
});

const _retainTypes = (): void => {
  routes.products.href({
    // @ts-expect-error `products` declares no `tab`.
    retain: { from: {}, keys: ['tab'] },
  });

  routes.orders.href({
    // @ts-expect-error A retained value has the type of the target's codec.
    retain: { from: { q: 1 }, keys: ['q'] },
  });
};

describe('href: retain', () => {
  test('carries the named search values from another page into the Href', () => {
    const list = matchRoutes(routes, {
      pathname: '/products/',
      search: 'q=shoe&tags=red&tags=blue&page=3',
    });

    assert.isTrue(list.route === 'products');

    // A filter kept on the item page; the page number is not.
    const href = routes.products.item.href(
      { productId: asSafeInt(7) },
      { retain: { from: list.search, keys: ['q', 'tags'] } },
    );

    assert.strictEqual(href, '/products/7/?q=shoe&tags=red&tags=blue');
  });

  test('a value given in search wins over the one retained', () => {
    const href = routes.products.href({
      search: { q: 'boot' },
      retain: { from: { q: 'shoe', page: asSafeInt(2) }, keys: ['q', 'page'] },
    });

    assert.strictEqual(href, '/products/?q=boot&page=2');
  });

  test('an absent source value, or one equal to its default, is left out', () => {
    assert.strictEqual(
      routes.products.href({
        retain: {
          from: { q: undefined, page: asSafeInt(1) },
          keys: ['q', 'page'],
        },
      }),
      '/products/',
    );
  });

  test('works between pages that each declare the key', () => {
    const list = matchRoutes(routes, {
      pathname: '/products/',
      search: 'q=shoe',
    });

    assert.isTrue(list.route === 'products');

    assert.strictEqual(
      routes.orders.href({ retain: { from: list.search, keys: ['q'] } }),
      '/orders/?q=shoe',
    );
  });

  test("the Href is the canonical one, so isActive and Link's same-URL replace compare it as before", async () => {
    const router = createRouter(routes, {
      browser: createMemoryBrowser('https://example.com/orders/'),
    });

    router.push(routes.products.href({ search: { q: 'shoe' } }));

    const m = Optional.unwrap(router.match.getSnapshot());

    assert.isTrue(m.route === 'products');

    const retained = routes.products.href({
      retain: { from: m.search, keys: ['q'] },
    });

    // The same string as the hand-built Href and as the URL itself.
    assert.strictEqual(
      retained,
      routes.products.href({ search: { q: 'shoe' } }),
    );

    assert.deepStrictEqual(
      router.parseHref('https://example.com/products/?q=shoe'),
      Optional.some(retained),
    );

    assert.isTrue(
      Optional.unwrap(
        router.isActive(routes.products, { exact: true }).getSnapshot(),
      ),
    );

    // A push to where the location already is replaces the entry, so back
    // leaves the page.
    router.push(retained);

    router.back();

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'orders',
    );

    router.dispose();
  });
});

describe('href: retain types', () => {
  test("keys are the target page's search keys, and values its types", () => {
    expectType<typeof _retainTypes, () => void>('=');
  });
});

describe('href: defaults', () => {
  test('a value equal to its default is left out of the URL', () => {
    assert.strictEqual(
      routes.products.item.href(
        { productId: asSafeInt(7) },
        { search: { page: asSafeInt(1), tab: 'spec' } },
      ),
      '/products/7/',
    );

    assert.strictEqual(
      routes.products.item.href(
        { productId: asSafeInt(7) },
        { search: { tab: 'reviews' } },
      ),
      '/products/7/?tab=reviews',
    );
  });
});
