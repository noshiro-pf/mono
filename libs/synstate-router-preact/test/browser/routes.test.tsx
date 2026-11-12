import { act, render } from '@testing-library/preact';
import { createContext, type JSX } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { asSafeInt, expectType, type SafeInt } from 'ts-data-forge';
import { routes, setup } from './fixture.js';

/**
 * The same element type for every page, so that only the key can make Preact
 * replace the node rather than update it.
 */
const page = (label: string): JSX.Element => <p data-testid="page">{label}</p>;

describe('Routes', () => {
  test('draws the case of the page, with its params and search', () => {
    const {
      bound: { Routes },
    } = setup('/products/42/?q=shoe');

    const { container } = render(
      <Routes
        cases={{
          home: () => 'home',
          products: () => 'products',
          'products.new': () => 'new',
          'products.item': ({ params, search }) => {
            expectType<typeof params.productId, SafeInt>('=');

            return `item ${params.productId} ${search.q ?? ''} ${search.page}`;
          },
          settings: () => 'settings',
          drafts: undefined,
        }}
        notFound="not found"
      />,
    );

    assert.strictEqual(container.textContent, 'item 42 shoe 1');
  });

  test('draws notFound for no page and for a case left undefined', async () => {
    const {
      router,
      bound: { Routes },
    } = setup('/nowhere/');

    const cases = {
      home: () => 'home',
      products: () => 'products',
      'products.new': () => 'new',
      'products.item': () => 'item',
      settings: () => 'settings',
      drafts: undefined,
    } as const;

    const { container } = render(<Routes cases={cases} notFound="not found" />);

    assert.strictEqual(container.textContent, 'not found');

    await act(() => {
      router.push(routes.drafts.href());
    });

    assert.strictEqual(container.textContent, 'not found');

    await act(() => {
      router.push(routes.settings.href());
    });

    assert.strictEqual(container.textContent, 'settings');
  });

  test('remounts on a new route and updates on new params of the same route', async () => {
    const {
      router,
      bound: { Routes },
    } = setup('/products/1/');

    const { getByTestId } = render(
      <Routes
        cases={{
          home: () => page('home'),
          products: () => page('products'),
          'products.new': () => page('new'),
          'products.item': (item) => page(`item ${item.params.productId}`),
          settings: () => page('settings'),
          drafts: undefined,
        }}
      />,
    );

    const first = getByTestId('page');

    await act(() => {
      router.push(routes.products.item.href({ productId: asSafeInt(2) }));
    });

    assert.strictEqual(getByTestId('page').textContent, 'item 2');

    assert.strictEqual(getByTestId('page'), first);

    await act(() => {
      router.push(routes.products.href());
    });

    assert.strictEqual(getByTestId('page').textContent, 'products');

    assert.notStrictEqual(getByTestId('page'), first);
  });

  test('gives a case its own hooks, remounted with the case', async () => {
    const {
      router,
      bound: { Routes },
    } = setup('/settings/');

    const Label = createContext('first');

    /** A case that keeps the first value it read in state. */
    const Kept = (): string => {
      const [kept] = useState(useContext(Label));

      return kept;
    };

    // The same object on every render, as a hoisted `cases` would be. The cases
    // call hooks themselves, and different numbers of them.
    const cases = {
      home: () => useContext(Label),
      products: () => 'products',
      'products.new': () => 'new',
      'products.item': () => 'item',
      settings: Kept,
      drafts: undefined,
    } as const;

    const { container, rerender } = render(
      <Label.Provider value="first">
        <Routes cases={cases} />
      </Label.Provider>,
    );

    assert.strictEqual(container.textContent, 'first');

    rerender(
      <Label.Provider value="second">
        <Routes cases={cases} />
      </Label.Provider>,
    );

    // Kept in state on the same case...
    assert.strictEqual(container.textContent, 'first');

    await act(() => {
      router.push(routes.home.href());
    });

    // ...read again by another case...
    assert.strictEqual(container.textContent, 'second');

    await act(() => {
      router.push(routes.settings.href());
    });

    // ...and fresh when the first case is drawn again.
    assert.strictEqual(container.textContent, 'second');
  });

  test('withSearch makes this page with part of its search changed', () => {
    const {
      bound: { Routes },
    } = setup('/products/?q=shoe&page=3');

    const { container } = render(
      <Routes
        cases={{
          home: undefined,
          products: ({ withSearch }) => withSearch({ page: asSafeInt(1) }),
          'products.new': undefined,
          'products.item': undefined,
          settings: undefined,
          drafts: undefined,
        }}
      />,
    );

    assert.strictEqual(container.textContent, '/products/?q=shoe');
  });

  test('nests a layout through prefix and under', async () => {
    const {
      router,
      bound: { Routes },
    } = setup('/products/new/');

    const { container } = render(
      <Routes
        prefix
        cases={{
          home: () => 'home',
          products: (layout) => (
            <section>
              {`layout ${layout.search.page} / `}
              <Routes
                under={routes.products}
                cases={{
                  products: () => 'list',
                  'products.new': () => 'new',
                  'products.item': (item) => `item ${item.params.productId}`,
                }}
              />
            </section>
          ),
          settings: () => 'settings',
          drafts: undefined,
        }}
        notFound="not found"
      />,
    );

    assert.strictEqual(container.textContent, 'layout 1 / new');

    await act(() => {
      router.push(routes.products.item.href({ productId: asSafeInt(7) }));
    });

    assert.strictEqual(container.textContent, 'layout 1 / item 7');

    await act(() => {
      router.push(routes.settings.href());
    });

    assert.strictEqual(container.textContent, 'settings');
  });

  test('makes the navigation scroll once the new page is in the document', async () => {
    const {
      router,
      browser,
      bound: { Routes },
    } = setup('/');

    render(
      <Routes
        cases={{
          home: () => 'home',
          products: () => 'products',
          'products.new': undefined,
          'products.item': undefined,
          settings: () => 'settings',
          drafts: undefined,
        }}
      />,
    );

    await act(() => {
      router.push(routes.settings.href());
    });

    // Before the frame: the layout effect made it.
    assert.deepStrictEqual(browser.scrolls(), ['top']);
  });
});
