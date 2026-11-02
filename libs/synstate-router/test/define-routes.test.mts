import { asSafeInt, Optional } from 'ts-data-forge';
import type { Brand } from 'ts-type-forge';
import {
  defineRoutes,
  matchRoutes,
  param,
  search,
  type RouteDefinitions,
} from '../src/index.mjs';

type UserId = Brand<string, 'UserId'>;

const isUserId = (s: string): s is UserId => s !== 'admin';

const userId = param.refine(param.string, isUserId);

const routes = defineRoutes({
  home: { segment: '' },
  products: {
    search: {
      page: search.int({ default: 1 }),
      q: search.string(),
      tags: search.array(search.string()),
    },
    children: {
      new: {},
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
  sandbox: {
    params: { env: param.literal('live', 'sandbox') },
    children: { projects: {} },
  },
  users: {
    children: {
      new: {},
      item: { params: { userId }, children: { posts: {} } },
    },
  },
  settings: { segment: 'user-settings' },
});

describe(matchRoutes, () => {
  test('matches the root page', () => {
    assert.deepStrictEqual<unknown>(matchRoutes(routes, { pathname: '/' }), {
      route: 'home',
      params: {},
      search: {},
    });
  });

  test('reads params through their codecs and search with defaults', () => {
    assert.deepStrictEqual<unknown>(
      matchRoutes(routes, {
        pathname: '/products/42/',
        search: '?q=shoe&tags=a&tags=b',
      }),
      {
        route: 'products.item',
        params: { productId: 42 },
        search: { page: 1, q: 'shoe', tags: ['a', 'b'] },
      },
    );
  });

  test('accepts the path with or without a trailing slash', () => {
    assert.isTrue(
      matchRoutes(routes, { pathname: '/products/42' }).route ===
        'products.item',
    );
  });

  test('tries static segments before the dynamic one', () => {
    assert.isTrue(
      matchRoutes(routes, { pathname: '/products/new/' }).route ===
        'products.new',
    );
  });

  test('falls through to not found when a param does not decode', () => {
    assert.deepStrictEqual<unknown>(
      matchRoutes(routes, { pathname: '/products/abc/' }),
      {
        route: undefined,
        pathname: '/products/abc/',
      },
    );

    assert.isTrue(
      matchRoutes(routes, { pathname: '/products/042/' }).route === undefined,
    );

    assert.isTrue(
      matchRoutes(routes, { pathname: '/staging/projects/' }).route ===
        undefined,
    );
  });

  test('backtracks from a static branch to the dynamic sibling', () => {
    assert.deepStrictEqual<unknown>(
      matchRoutes(routes, { pathname: '/users/new/posts/' }),
      {
        route: 'users.item.posts',
        params: { userId: 'new' },
        search: {},
      },
    );
  });

  test('does not match a node with page: false', () => {
    assert.isTrue(
      matchRoutes(routes, { pathname: '/products/1/reviews/' }).route ===
        undefined,
    );

    assert.deepStrictEqual<unknown>(
      matchRoutes(routes, { pathname: '/products/1/reviews/r9/' }),
      {
        route: 'products.item.reviews.item',
        params: { productId: 1, reviewId: 'r9' },
        search: { page: 1, q: undefined, tags: [] },
      },
    );
  });

  test('uses segment in place of the key', () => {
    assert.isTrue(
      matchRoutes(routes, { pathname: '/user-settings/' }).route === 'settings',
    );

    assert.isTrue(
      matchRoutes(routes, { pathname: '/settings/' }).route === undefined,
    );
  });

  test('reads an invalid search value as absent', () => {
    const warn = vi.fn();

    vi.stubGlobal('console', { ...console, warn });

    try {
      const m = matchRoutes(routes, {
        pathname: '/products/',
        search: 'page=x',
      });

      assert.isTrue(m.route === 'products' && m.search.page === 1);

      expect(warn).toHaveBeenCalledExactlyOnceWith(
        'synstate-router: products: search "page" is not valid and is read as absent',
      );
    } finally {
      // cspell:disable-next-line
      vi.unstubAllGlobals();
    }
  });

  test('reads an asynchronously validated search value as absent', () => {
    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    try {
      const asyncRoutes = defineRoutes({
        list: {
          search: {
            q: search.schema({
              '~standard': {
                version: 1,
                vendor: 'test',
                validate: (value) => Promise.resolve({ value: typeof value }),
              },
            }),
          },
        },
      });

      const m = matchRoutes(asyncRoutes, { pathname: '/list/', search: 'q=a' });

      assert.isTrue(m.route === 'list' && m.search.q === undefined);

      expect(error).toHaveBeenCalledExactlyOnceWith(
        'synstate-router: list: the schema of search "q" validated asynchronously; the value is read as absent',
      );
    } finally {
      // cspell:disable-next-line
      vi.unstubAllGlobals();
    }
  });

  test('decodes percent-encoded segments before the codec', () => {
    const m = matchRoutes(routes, {
      pathname: '/products/1/reviews/a%2Fb%20c/',
    });

    assert.isTrue(
      m.route === 'products.item.reviews.item' && m.params.reviewId === 'a/b c',
    );
  });

  test('reads malformed percent-encoding as not found', () => {
    assert.isTrue(
      matchRoutes(routes, { pathname: '/products/1/reviews/%E0%A4%A/' })
        .route === undefined,
    );
  });
});

describe('node.match and node.matchExact', () => {
  test('match is a prefix match from the whole-tree result', () => {
    const m = routes.products.item.match({
      pathname: '/products/7/reviews/r1/',
    });

    assert.deepStrictEqual<unknown>(
      m,
      Optional.some({
        params: { productId: 7 },
        search: { page: 1, q: undefined, tags: [] },
      }),
    );

    assert.isTrue(
      Optional.isNone(
        routes.products.item.matchExact({
          pathname: '/products/7/reviews/r1/',
        }),
      ),
    );
  });

  test('a branch the tree backtracked out of does not match', () => {
    const location = { pathname: '/users/new/posts/' } as const;

    assert.isTrue(Optional.isNone(routes.users.new.match(location)));

    assert.isTrue(Optional.isSome(routes.users.item.match(location)));
  });

  test('a page: false node matches its descendants', () => {
    assert.isTrue(
      Optional.isSome(
        routes.products.item.reviews.match({
          pathname: '/products/7/reviews/r1/',
        }),
      ),
    );
  });
});

describe('node.href', () => {
  test('builds the path with a trailing slash', () => {
    assert.isTrue(routes.home.href() === '/');

    assert.isTrue(
      routes.products.item.href({ productId: asSafeInt(42) }) ===
        '/products/42/',
    );

    assert.isTrue(
      routes.sandbox.projects.href({ env: 'live' }) === '/live/projects/',
    );

    assert.isTrue(routes.settings.href() === '/user-settings/');
  });

  test('encodes params so that they stay one segment', () => {
    const href = routes.products.item.reviews.item.href({
      productId: asSafeInt(1),
      reviewId: 'a/b c%',
    });

    assert.isTrue(href === '/products/1/reviews/a%2Fb%20c%25/');

    const m = matchRoutes(routes, { pathname: href });

    assert.isTrue(
      m.route === 'products.item.reviews.item' &&
        m.params.reviewId === 'a/b c%',
    );
  });

  test('writes search in declaration order and leaves defaults out', () => {
    assert.isTrue(
      routes.products.href({
        search: { tags: ['x', 'y'], page: asSafeInt(1), q: 'a b' },
      }) === '/products/?q=a+b&tags=x&tags=y',
    );

    assert.isTrue(
      routes.products.href({ search: { page: asSafeInt(2) } }) ===
        '/products/?page=2',
    );
  });

  test('writes the hash', () => {
    assert.isTrue(routes.products.href({ hash: 'top' }) === '/products/#top');
  });

  test('round-trips non-ASCII and reserved characters', () => {
    const name = 'ä/?#%';

    const href = routes.products.item.reviews.item.href(
      { productId: asSafeInt(3), reviewId: name },
      { search: { q: name } },
    );

    const url = new URL(href, 'https://example.com');

    const m = matchRoutes(routes, {
      pathname: url.pathname,
      search: url.search,
    });

    assert.isTrue(
      m.route === 'products.item.reviews.item' &&
        m.params.reviewId === name &&
        m.search.q === name,
    );
  });

  test('throws on a value its own codec rejects', () => {
    assert.throws(
      () =>
        routes.products.item.reviews.item.href({
          productId: asSafeInt(1),
          reviewId: '',
        }),
      /rejected by its own codec/u,
    );

    assert.throws(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- what the guard is there to catch
      () => routes.users.item.href({ userId: 'admin' as UserId }),
      /rejected by its own codec/u,
    );
  });

  test('throws when the path resolves to another route', () => {
    // Backtracking resolves this one to the dynamic branch, as asked.
    assert.doesNotThrow(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a value the guard accepts
      () => routes.users.item.posts.href({ userId: 'new' as UserId }),
    );

    assert.throws(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a value the guard accepts
      () => routes.users.item.href({ userId: 'new' as UserId }),
      /resolves to users\.new/u,
    );
  });

  test('throws on a dot segment, which a URL parser would remove', () => {
    for (const reviewId of ['.', '..']) {
      assert.throws(
        () =>
          routes.products.item.reviews.item.href({
            productId: asSafeInt(3),
            reviewId,
          }),
        /cannot be a path segment/u,
      );
    }

    assert.isTrue(
      routes.products.item.reviews.item.href({
        productId: asSafeInt(3),
        reviewId: '...',
      }) === '/products/3/reviews/.../',
    );
  });

  test('throws on an empty segment, which would collapse into "//"', () => {
    const r = defineRoutes({
      u: { params: { x: param.literal('', 'a') } },
    });

    assert.throws(() => r.u.href({ x: '' }), /cannot be a path segment/u);

    assert.isTrue(r.u.href({ x: 'a' }) === '/a/');
  });

  test('throws on a string that is not well-formed Unicode', () => {
    assert.throws(
      () =>
        routes.products.item.reviews.item.href({
          productId: asSafeInt(3),
          reviewId: '\u{D83D}',
        }),
      /not well-formed Unicode/u,
    );

    assert.throws(
      () => routes.products.href({ hash: '\u{D83D}' }),
      /the hash is not well-formed Unicode/u,
    );
  });

  test('throws on a search value that does not read back', () => {
    const odd = defineRoutes({
      list: {
        search: {
          n: search.custom({
            decode: (raw: string) => Optional.some(raw.length),
            encode: (value: number) => 'x'.repeat(value + 1),
          }),
        },
      },
    });

    assert.throws(
      () => odd.list.href({ search: { n: 2 } }),
      /does not read back/u,
    );
  });
});

/** Runs the run-time checks on a tree the type checker would reject. */
const define = (definition: RouteDefinitions): unknown =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the run-time check is under test, not the type
  defineRoutes(definition as never);

describe('defineRoutes rejects ambiguous and invalid trees', () => {
  test('two dynamic segments at one level', () => {
    assert.throws(
      () =>
        define({
          a: { params: { x: param.string } },
          b: { params: { y: param.string } },
        }),
      /dynamic segments at the same level/u,
    );
  });

  test('two dynamic segments at one level through segment: ""', () => {
    assert.throws(
      () =>
        define({
          shell: {
            segment: '',
            page: false,
            children: { a: { params: { x: param.string } } },
          },
          b: { params: { y: param.string } },
        }),
      /dynamic segments at the same level/u,
    );
  });

  test('two equal static segments', () => {
    assert.throws(
      () => define({ a: { segment: 'x' }, b: { segment: 'x' } }),
      /same segment "x"/u,
    );
  });

  test('two pages on one path', () => {
    assert.throws(
      () => define({ a: { children: { index: { segment: '' } } } }),
      /pages on the same path/u,
    );

    assert.doesNotThrow(() =>
      define({ a: { page: false, children: { index: { segment: '' } } } }),
    );
  });

  test('reserved keys and keys with "." or "/"', () => {
    assert.throws(() => define({ href: {} }), /reserved/u);

    assert.throws(() => define({ 'a.b': {} }), /contains "\." or "\/"/u);

    assert.throws(() => define({ '': {} }), /is empty/u);

    assert.throws(
      () => define({ a: { segment: 'x/y' } }),
      /cannot be a path segment/u,
    );

    assert.throws(
      () => define({ a: { segment: '..' } }),
      /cannot be a path segment/u,
    );
  });

  test('a segment named like a reserved key, or with a dot, is allowed', () => {
    const r = defineRoutes({
      searchPage: { segment: 'search' },
      sitemap: { segment: 'sitemap.xml' },
    });

    assert.isTrue(
      matchRoutes(r, { pathname: '/search/' }).route === 'searchPage',
    );

    assert.isTrue(r.sitemap.href() === '/sitemap.xml/');
  });

  test('params with other than one key, or with segment', () => {
    assert.throws(() => define({ a: { params: {} } }), /exactly one key/u);

    assert.throws(
      () => define({ a: { params: { x: param.string, y: param.string } } }),
      /exactly one key/u,
    );

    assert.throws(
      () => define({ a: { segment: 'a', params: { x: param.string } } }),
      /has no segment/u,
    );
  });

  test('a search key declared again by a descendant', () => {
    assert.throws(
      () =>
        define({
          a: {
            search: { q: search.string() },
            children: { b: { search: { q: search.string() } } },
          },
        }),
      /already declared/u,
    );
  });

  test('a static segment beside a dynamic one is not ambiguous', () => {
    assert.doesNotThrow(() =>
      define({ a: { segment: 'new' }, b: { params: { x: param.string } } }),
    );
  });

  test('static before dynamic also through segment: ""', () => {
    const r = defineRoutes({
      shell: {
        segment: '',
        children: {
          item: { params: { id: param.string } },
        },
      },
      about: {},
    });

    assert.isTrue(matchRoutes(r, { pathname: '/about/' }).route === 'about');

    assert.isTrue(matchRoutes(r, { pathname: '/x/' }).route === 'shell.item');

    assert.isTrue(matchRoutes(r, { pathname: '/' }).route === 'shell');
  });
});
