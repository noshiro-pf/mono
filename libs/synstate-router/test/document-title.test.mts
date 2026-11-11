import { asSafeInt, Optional } from 'ts-data-forge';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  param,
  search,
} from '../src/index.mjs';

const routes = defineRoutes({
  home: { segment: '', meta: { title: 'Home' } },
  products: {
    meta: { title: 'Products', label: 'Products' },
    search: { q: search.string() },
    children: {
      item: {
        params: { productId: param.int },
        meta: {
          // The params are typed as a record: `meta` is written before the node
          // has a type.
          title: ({ params }) => {
            const id = params['productId'];

            return typeof id === 'number'
              ? `Product ${id.toString()}`
              : 'Product';
          },
        },
        children: {
          // No title: its parent's applies.
          reviews: {},
        },
      },
    },
  },
  settings: {},
});

const setup = (
  url: string,
): Readonly<{
  router: ReturnType<typeof createRouter<typeof routes>>;
  browser: ReturnType<typeof createMemoryBrowser>;
}> => {
  const browser = createMemoryBrowser(url, { title: 'App' });

  return { router: createRouter(routes, { browser }), browser };
};

describe('document title', () => {
  test('is the title of the matched page from the start', () => {
    const { browser, router } = setup('https://example.com/products/');

    assert.strictEqual(browser.title(), 'Products');

    router.dispose();
  });

  test('is the deepest title of the branch', () => {
    const { browser, router } = setup(
      'https://example.com/products/7/reviews/',
    );

    assert.strictEqual(browser.title(), 'Product 7');

    router.dispose();
  });

  test('follows navigation, and a title from params updates when only the params change', () => {
    const { browser, router } = setup('https://example.com/');

    assert.strictEqual(browser.title(), 'Home');

    router.push(routes.products.item.href({ productId: asSafeInt(1) }));

    assert.strictEqual(browser.title(), 'Product 1');

    router.push(routes.products.item.href({ productId: asSafeInt(2) }));

    assert.strictEqual(browser.title(), 'Product 2');

    router.dispose();
  });

  test('goes back to the document title when the page has none', () => {
    const { browser, router } = setup('https://example.com/products/');

    router.push(routes.settings.href());

    assert.strictEqual(browser.title(), 'App');

    router.dispose();
  });

  test('is left alone by a router that never set one', () => {
    const { browser, router } = setup('https://example.com/settings/');

    assert.strictEqual(browser.title(), 'App');

    // The app sets its own, which a page without a title does not undo.
    browser.documentTitle?.set('Settings (app)');

    router.push(routes.settings.href({ hash: 'x' }));

    router.replace(routes.settings.href());

    assert.strictEqual(browser.title(), 'Settings (app)');

    router.dispose();
  });

  test('is not written after dispose', () => {
    const { browser, router } = setup('https://example.com/');

    router.dispose();

    router.push(routes.products.href());

    // The match moved on; the title did not.
    assert.strictEqual(
      Optional.unwrap(router.match.getSnapshot()).route,
      'products',
    );

    assert.strictEqual(browser.title(), 'Home');
  });
});
