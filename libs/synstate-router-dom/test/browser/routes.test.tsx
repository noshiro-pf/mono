import { constant, inlineMap, type Constant } from 'synstate-dom';
import { asSafeInt, expectType, type SafeInt } from 'ts-data-forge';
import { afterUpdate, mountInto, routes, setup } from './fixture.js';

/** A fixed label for a page. */
const page = (label: string): Constant<string> => constant(label);

describe('Routes', () => {
  test('mounts the case of the page, with its params and search', () => {
    const {
      bound: { Routes },
    } = setup('/products/42/?q=shoe');

    const { container, unmount } = mountInto(() => (
      <Routes
        cases={{
          home: () => <p>{page('home')}</p>,
          products: () => <p>{page('products')}</p>,
          'products.new': () => <p>{page('new')}</p>,
          'products.item': (item$) => {
            expectType<
              typeof item$.getSnapshot extends () => Readonly<{
                value: Readonly<{ params: Readonly<{ productId: infer P }> }>;
              }>
                ? P
                : never,
              SafeInt
            >('=');

            return (
              <p>
                {inlineMap(
                  item$,
                  (item) =>
                    `item ${item.params.productId} ${item.search.q ?? ''} ${item.search.page}`,
                )}
              </p>
            );
          },
          settings: () => <p>{page('settings')}</p>,
          drafts: undefined,
        }}
        notFound={<p>{page('not found')}</p>}
      />
    ));

    assert.strictEqual(container.textContent, 'item 42 shoe 1');

    unmount();
  });

  test('mounts notFound for no page and for a case left undefined', () => {
    const {
      router,
      bound: { Routes },
    } = setup('/nowhere/');

    const { container, unmount } = mountInto(() => (
      <Routes
        cases={{
          home: () => <p>{page('home')}</p>,
          products: () => <p>{page('products')}</p>,
          'products.new': () => <p>{page('new')}</p>,
          'products.item': () => <p>{page('item')}</p>,
          settings: () => <p>{page('settings')}</p>,
          drafts: undefined,
        }}
        notFound={<p>{page('not found')}</p>}
      />
    ));

    assert.strictEqual(container.textContent, 'not found');

    router.push(routes.drafts.href());

    assert.strictEqual(container.textContent, 'not found');

    router.push(routes.settings.href());

    assert.strictEqual(container.textContent, 'settings');

    unmount();
  });

  test('keeps the case on new params of the same route, and remounts on a new route', () => {
    const {
      router,
      bound: { Routes },
    } = setup('/products/1/');

    const { container, unmount } = mountInto(() => (
      <Routes
        cases={{
          home: () => <p>{page('home')}</p>,
          products: () => <p>{page('products')}</p>,
          'products.new': () => <p>{page('new')}</p>,
          'products.item': (item$) => (
            <p>{inlineMap(item$, (item) => `item ${item.params.productId}`)}</p>
          ),
          settings: () => <p>{page('settings')}</p>,
          drafts: undefined,
        }}
      />
    ));

    const first = container.querySelector('p');

    router.push(routes.products.item.href({ productId: asSafeInt(2) }));

    assert.strictEqual(container.textContent, 'item 2');

    assert.strictEqual(container.querySelector('p'), first);

    router.push(routes.products.href());

    assert.strictEqual(container.textContent, 'products');

    assert.notStrictEqual(container.querySelector('p'), first);

    unmount();
  });

  test('withSearch makes this page with part of its search changed', () => {
    const {
      bound: { Routes },
    } = setup('/products/?q=shoe&page=3');

    const { container, unmount } = mountInto(() => (
      <Routes
        cases={{
          home: undefined,
          products: (list$) => (
            <p>
              {inlineMap(list$, (list) =>
                list.withSearch({ page: asSafeInt(1) }),
              )}
            </p>
          ),
          'products.new': undefined,
          'products.item': undefined,
          settings: undefined,
          drafts: undefined,
        }}
      />
    ));

    assert.strictEqual(container.textContent, '/products/?q=shoe');

    unmount();
  });

  test('nests a layout through prefix and under, keeping the layout across its pages', () => {
    const {
      router,
      bound: { Routes },
    } = setup('/products/new/');

    const { container, unmount } = mountInto(() => (
      <Routes
        prefix
        cases={{
          home: () => <p>{page('home')}</p>,
          products: (layout$) => (
            <section>
              {inlineMap(
                layout$,
                (layout) => `layout ${layout.search.page} / `,
              )}
              <Routes
                under={routes.products}
                cases={{
                  products: () => <>{page('list')}</>,
                  'products.new': () => <>{page('new')}</>,
                  'products.item': (item$) => (
                    <>
                      {inlineMap(
                        item$,
                        (item) => `item ${item.params.productId}`,
                      )}
                    </>
                  ),
                }}
              />
            </section>
          ),
          settings: () => <p>{page('settings')}</p>,
          drafts: undefined,
        }}
        notFound={<p>{page('not found')}</p>}
      />
    ));

    assert.strictEqual(container.textContent, 'layout 1 / new');

    const section = container.querySelector('section');

    router.push(
      routes.products.item.href(
        { productId: asSafeInt(7) },
        { search: { page: asSafeInt(2) } },
      ),
    );

    assert.strictEqual(container.textContent, 'layout 2 / item 7');

    assert.strictEqual(container.querySelector('section'), section);

    router.push(routes.settings.href());

    assert.strictEqual(container.textContent, 'settings');

    unmount();
  });

  test('follows the layout again after leaving it and coming back', () => {
    const {
      router,
      bound: { Routes },
    } = setup('/products/new/');

    const { container, unmount } = mountInto(() => (
      <Routes
        prefix
        cases={{
          home: undefined,
          products: (layout$) => (
            <p>
              {inlineMap(layout$, (layout) => `page ${layout.search.page}`)}
            </p>
          ),
          settings: () => <p>{page('settings')}</p>,
          drafts: undefined,
        }}
      />
    ));

    router.push(routes.settings.href());

    for (const n of [2, 3] as const) {
      router.push(
        routes.products.item.href(
          { productId: asSafeInt(n) },
          { search: { page: asSafeInt(n) } },
        ),
      );

      assert.strictEqual(container.textContent, `page ${n}`);
    }

    unmount();
  });

  test('makes the navigation scroll once the update has finished, before the frame', async () => {
    const {
      router,
      browser,
      bound: { Routes },
    } = setup('/');

    const { unmount } = mountInto(() => (
      <Routes
        cases={{
          home: () => <p>{page('home')}</p>,
          products: () => <p>{page('products')}</p>,
          'products.new': undefined,
          'products.item': undefined,
          settings: () => <p>{page('settings')}</p>,
          drafts: undefined,
        }}
      />
    ));

    router.push(routes.settings.href());

    assert.deepStrictEqual(browser.scrolls(), []);

    await afterUpdate();

    assert.deepStrictEqual(browser.scrolls(), ['top']);

    unmount();
  });

  test('makes one scroll per update with a layout and its pages mounted', async () => {
    const {
      router,
      browser,
      bound: { Routes },
    } = setup('/products/new/');

    const { unmount } = mountInto(() => (
      <Routes
        prefix
        cases={{
          home: undefined,
          products: () => (
            <section>
              <Routes
                under={routes.products}
                cases={{
                  products: () => <p>{page('list')}</p>,
                  'products.new': () => <p>{page('new')}</p>,
                  'products.item': () => <p>{page('item')}</p>,
                }}
              />
            </section>
          ),
          settings: () => <p>{page('settings')}</p>,
          drafts: undefined,
        }}
      />
    ));

    // The inner `Routes` rebuilds.
    router.push(routes.products.item.href({ productId: asSafeInt(1) }));

    await afterUpdate();

    assert.deepStrictEqual(browser.scrolls(), ['top']);

    // The outer one rebuilds and unmounts the inner one.
    router.push(routes.settings.href());

    await afterUpdate();

    assert.deepStrictEqual(browser.scrolls(), ['top', 'top']);

    unmount();
  });

  test('unmounting removes the case and stops following the router', () => {
    const {
      router,
      bound: { Routes },
    } = setup('/');

    const { container, unmount } = mountInto(() => (
      <div>
        <Routes
          cases={{
            home: () => <p>{page('home')}</p>,
            products: () => <p>{page('products')}</p>,
            'products.new': undefined,
            'products.item': undefined,
            settings: () => <p>{page('settings')}</p>,
            drafts: undefined,
          }}
        />
      </div>
    ));

    const inner = container.firstElementChild;

    unmount();

    router.push(routes.settings.href());

    assert.strictEqual(inner?.textContent, '');
  });
});
