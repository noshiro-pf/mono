import { renderToStaticMarkup } from 'react-dom/server';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  externalHref,
  param,
  search,
} from 'synstate-router';
import { createReactRouter } from 'synstate-router-react';
import { asSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('README: Routes and Link', () => {
    // embed-sample-code-ignore-above

    const routes = defineRoutes({
      home: { segment: '' },
      products: {
        search: { page: search.int({ default: 1 }) },
        children: { item: { params: { productId: param.int } } },
      },
      settings: {},
    });

    const router = createRouter(routes, {
      // The real window when left out.
      browser: createMemoryBrowser('https://example.com/products/42/'),
    });

    // Bound to the router: no context, no global registration. Export these
    // from one module of the application.
    const { Routes, Link } = createReactRouter(router);

    const App = (): React.JSX.Element => (
      <>
        <nav>
          <Link to={routes.products.href()}>{'Products'}</Link>
          <Link to={externalHref('https://example.com/help')}>{'Help'}</Link>
        </nav>
        <Routes
          cases={{
            // Every page is a required key: a new route without a case fails
            // `tsc`.
            home: () => <h1>{'Home'}</h1>,
            products: (list) => (
              <Link
                to={list.withSearch({ page: asSafeInt(list.search.page + 1) })}
              >
                {'Next page'}
              </Link>
            ),
            'products.item': (item) => (
              <h1>{`Product ${item.params.productId}`}</h1>
            ),
            settings: undefined, // not drawn yet: falls to notFound
          }}
          notFound={<h1>{'Not found'}</h1>}
        />
      </>
    );

    assert.strictEqual(
      renderToStaticMarkup(<App />),
      '<nav><a href="/products/">Products</a><a href="https://example.com/help">Help</a></nav><h1>Product 42</h1>',
    );

    // embed-sample-code-ignore-below
  });
}
