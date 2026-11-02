import {
  asSafeInt,
  expectType,
  type Optional,
  type SafeInt,
} from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  defineRoutes,
  matchRoutes,
  param,
  search,
  type Href,
  type RouteId,
  type RouteMatch,
} from '../src/index.mjs';

const routes = defineRoutes({
  home: { segment: '' },
  products: {
    search: {
      page: search.int({ default: 1 }),
      q: search.string(),
    },
    children: {
      item: {
        params: { productId: param.int },
        children: {
          reviews: {
            page: false,
            children: {
              item: { params: { reviewId: param.string } },
            },
          },
        },
      },
    },
  },
});

type Search = Readonly<{ page: SafeInt; q: string | undefined }>;

describe('RouteMatch', () => {
  test('is a union keyed by the dotted route id, without page: false nodes', () => {
    expectType<
      RouteMatch<typeof routes>,
      Readonly<
        | {
            route: 'home';
            params: ReadonlyRecord<never, never>;
            search: ReadonlyRecord<never, never>;
          }
        | {
            route: 'products';
            params: ReadonlyRecord<never, never>;
            search: Search;
          }
        | {
            route: 'products.item';
            params: Readonly<{ productId: SafeInt }>;
            search: Search;
          }
        | {
            route: 'products.item.reviews.item';
            params: Readonly<{ productId: SafeInt; reviewId: string }>;
            search: Search;
          }
        | { route: undefined; pathname: string }
      >
    >('~=');

    expectType<
      RouteId<typeof routes>,
      'home' | 'products' | 'products.item' | 'products.item.reviews.item'
    >('=');
  });

  test('narrows params in a switch', () => {
    const m = matchRoutes(routes, { pathname: '/products/1/' });

    switch (m.route) {
      case 'products.item':
        expectType<typeof m.params.productId, SafeInt>('=');

        break;

      case 'products.item.reviews.item':
        expectType<typeof m.params.reviewId, string>('=');

        break;

      case 'home':
      case 'products':
      case undefined:
        break;
    }
  });
});

describe('route nodes', () => {
  test('carry literal ids and patterns', () => {
    expectType<typeof routes.products.item.id, 'products.item'>('=');

    expectType<
      typeof routes.products.item.reviews.item.pattern,
      '/products/:productId/reviews/:reviewId'
    >('=');

    expectType<typeof routes.home.pattern, '/'>('=');
  });

  test('match returns the node own params and inherited search', () => {
    expectType<
      ReturnType<typeof routes.products.item.match>,
      Optional<
        Readonly<{
          params: Readonly<{ productId: SafeInt }>;
          search: Search;
        }>
      >
    >('~=');
  });

  test('a page: false node has no href or matchExact', () => {
    expectType<
      'href' extends keyof typeof routes.products.item.reviews ? true : false,
      false
    >('=');

    expectType<
      'matchExact' extends keyof typeof routes.products.item.reviews
        ? true
        : false,
      false
    >('=');
  });
});

// The functions below are never called: their calls are for the type checker,
// and the ones it rejects would throw at run time.

const _stringsAreNotHref = (id: number, fromVariable: string): void => {
  // @ts-expect-error A hand-written string is not an Href.
  '/prodcts/1/' satisfies Href;

  // @ts-expect-error Nor is a template literal.
  `/products/${id}/` satisfies Href;

  // @ts-expect-error Nor is a string variable.
  fromVariable satisfies Href;
};

const _paramMistakes = (): void => {
  // @ts-expect-error A number is not a SafeInt.
  routes.products.item.href({ productId: 1.5 });

  // @ts-expect-error A missing param.
  routes.products.item.href({});

  // @ts-expect-error A param of another route.
  routes.products.item.href({ productId: asSafeInt(1), reviewId: 'x' });

  // @ts-expect-error A node without params takes no params object.
  routes.home.href({ productId: asSafeInt(1) });
};

const _searchMistakes = (): void => {
  routes.products.href({ search: { q: 'shoe' } });

  routes.products.item.href(
    { productId: asSafeInt(1) },
    { search: { page: asSafeInt(2) } },
  );

  // @ts-expect-error A string is not the page number.
  routes.products.href({ search: { page: '2' } });

  // @ts-expect-error An undeclared search key.
  routes.products.href({ search: { sort: 'name' } });

  // @ts-expect-error The home page declares no search.
  routes.home.href({ search: { q: 'shoe' } });
};

const _invalidTrees = (): void => {
  defineRoutes({
    // @ts-expect-error `href` is a member of every node.
    href: {},
  });

  defineRoutes({
    a: {
      children: {
        // @ts-expect-error `match` is a member of every node.
        match: {},
      },
    },
  });

  defineRoutes({
    // @ts-expect-error `.` separates route ids.
    'a.b': {},
  });

  defineRoutes({
    // @ts-expect-error A segment is one path segment.
    a: { segment: 'x/y' },
  });

  defineRoutes({
    // @ts-expect-error A URL parser removes a `..` segment.
    a: { segment: '..' },
  });

  defineRoutes({
    // @ts-expect-error The empty key would merge into its parent's id.
    '': {},
  });

  defineRoutes({
    // @ts-expect-error Two keys.
    a: { params: { x: param.string, y: param.string } },
  });

  defineRoutes({
    // @ts-expect-error A params node is its dynamic segment alone.
    a: { segment: 'a', params: { x: param.string } },
  });

  // A segment may be a name that is reserved as a key, or contain a dot.
  defineRoutes({
    searchPage: { segment: 'search' },
    sitemap: { segment: 'sitemap.xml' },
  });
};

describe('href', () => {
  test('returns an Href, which a string is not', () => {
    const href = routes.products.item.href({ productId: asSafeInt(1) });

    expectType<typeof href, Href>('=');

    assert.strictEqual(href, '/products/1/');

    expectType<typeof _stringsAreNotHref, (id: number, s: string) => void>('=');
  });

  test('takes params and search typed by their codecs', () => {
    expectType<typeof _paramMistakes, () => void>('=');

    expectType<typeof _searchMistakes, () => void>('=');
  });
});

describe(defineRoutes, () => {
  test('rejects invalid trees by type', () => {
    expectType<typeof _invalidTrees, () => void>('=');
  });
});
