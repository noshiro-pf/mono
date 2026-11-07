import { map } from 'synstate';
import { constant, render } from 'synstate-dom';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  externalHref,
  param,
  search,
} from 'synstate-router';
import { createRouterComponents } from 'synstate-router-dom';
import { asSafeInt } from 'ts-data-forge';

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

// Bound to the router: synstate-dom has no context. Export these from one
// module of the application.
const { Routes, Link } = createRouterComponents(router);

const unmount = render(
  () => (
    <>
      <nav>
        <Link to={routes.products.href()}>{constant('Products')}</Link>
        <Link to={externalHref('https://example.com/help')}>
          {constant('Help')}
        </Link>
      </nav>
      <Routes
        cases={{
          // Every page is a required key: a new route without a case fails
          // `tsc`.
          home: () => <h1>{constant('Home')}</h1>,
          // Called once on entering the page; new params and search flow
          // through the observable.
          products: (list$) => (
            <Link
              to={list$.pipe(
                map((list) =>
                  list.withSearch({ page: asSafeInt(list.search.page + 1) }),
                ),
              )}
            >
              {constant('Next page')}
            </Link>
          ),
          'products.item': (item$) => (
            <h1>
              {item$.pipe(map((item) => `Product ${item.params.productId}`))}
            </h1>
          ),
          settings: undefined, // not drawn yet: falls to notFound
        }}
        notFound={<h1>{constant('Not found')}</h1>}
      />
    </>
  ),
  document.body,
);

assert.strictEqual(document.querySelector('h1')?.textContent, 'Product 42');

assert.strictEqual(
  document.querySelector('nav')?.getHTML(),
  '<a href="/products/">Products</a><a href="https://example.com/help">Help</a>',
);

unmount();
