import * as assert from 'node:assert/strict';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  externalHref,
  matchRoutes,
  param,
  search,
} from 'synstate-router';

// An Optional is `{ $$tag, value }` up to synstate 8 / ts-data-forge 14, and a
// value that is not a reserved string is its own Some from synstate 9.
// `published/` runs this file against the last release, so it reads both.
// It reads what this file asserts on (route matches and `true`), not a
// tagged value such as a `Result`, which holds `$$tag` itself. Each smoke file
// runs alone in its own project, so the helper is repeated in each that needs
// it.
const valueOf = (optional) =>
  typeof optional === 'object' && optional !== null && '$$tag' in optional
    ? optional.value
    : optional;

// The route tree, the codecs, `href` and matching, through what the package
// publishes. The Optional (ts-std-forge's, re-exported by ts-data-forge) is
// read through `valueOf` above, so that the check depends on nothing the
// consumer did not install.

const routes = defineRoutes({
  home: { segment: '' },
  products: {
    search: {
      page: search.int({ default: 1 }),
      tags: search.array(search.string()),
    },
    children: {
      new: {},
      item: { params: { productId: param.int } },
    },
  },
});

assert.equal(routes.products.item.pattern, '/products/:productId');

assert.equal(
  routes.products.item.href(
    { productId: 42 },
    { search: { tags: ['a', 'b'] } },
  ),
  '/products/42/?tags=a&tags=b',
);

assert.deepEqual(
  matchRoutes(routes, { pathname: '/products/7', search: 'page=' }),
  {
    route: 'products.item',
    params: { productId: 7 },
    search: { page: 1, tags: [] },
  },
);

// An invalid value is read as absent too (and warned about), so the default
// applies.
assert.equal(
  matchRoutes(routes, { pathname: '/products/', search: 'page=x' }).search.page,
  1,
);

assert.equal(
  matchRoutes(routes, { pathname: '/products/new/' }).route,
  'products.new',
);

assert.equal(
  matchRoutes(routes, { pathname: '/products/042/' }).route,
  undefined,
);

assert.equal(
  valueOf(routes.products.item.matchExact({ pathname: '/products/7/' })).params
    .productId,
  7,
);

assert.throws(() =>
  defineRoutes({
    a: { params: { x: param.string } },
    b: { params: { y: param.string } },
  }),
);

assert.equal(externalHref('https://example.com/'), 'https://example.com/');

// The router, with its peer synstate: the URL is canonicalized before the
// first state, and `push` updates at once.

const browser = createMemoryBrowser('https://example.com/app/products');

const router = createRouter(routes, { basePath: '/app/', browser });

assert.equal(browser.url().pathname, '/app/products/');

assert.equal(valueOf(router.match.getSnapshot()).route, 'products');

router.push(routes.products.item.href({ productId: 3 }));

assert.equal(browser.url().pathname, '/app/products/3/');

assert.equal(valueOf(router.isActive(routes.products).getSnapshot()), true);

router.dispose();

console.info('synstate-router: ok');
