import { Arr, expectType, Optional } from 'ts-data-forge';
import type { RelaxedExtract } from 'ts-type-forge';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  matchRoutes,
  param,
  type RestSegments,
  type RouteDefinitions,
  type RouteMatch,
} from '../src/index.mjs';

const routes = defineRoutes({
  docs: {
    children: {
      new: {},
      item: { params: { slug: param.string } },
      article: { params: { path: param.rest } },
    },
  },
  files: {
    page: false,
    children: {
      item: {
        params: {
          // A codec over the segments: the path as one string.
          path: param.restCustom({
            decode: (segments) =>
              segments.includes('secret')
                ? Optional.none
                : Optional.some(segments.join('/')),
            encode: (value) => {
              const [first = '', ...rest] = value.split('/');

              return Arr.toUnshifted(first)(rest);
            },
          }),
        },
      },
    },
  },
});

const _invalidRestTrees = (): void => {
  defineRoutes({
    docs: {
      params: { path: param.rest },
      // @ts-expect-error A rest node ends its branch.
      children: { edit: {} },
    },
  });
};

const define = (definition: RouteDefinitions): unknown =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the run-time check is under test, not the type
  defineRoutes(definition as never);

describe('param.rest', () => {
  test('types the value as the non-empty list of segments', () => {
    type M = RelaxedExtract<
      RouteMatch<typeof routes>,
      Readonly<{ route: 'docs.article' }>
    >;

    expectType<M['params'], Readonly<{ path: RestSegments }>>('=');

    type F = RelaxedExtract<
      RouteMatch<typeof routes>,
      Readonly<{ route: 'files.item' }>
    >;

    expectType<F['params'], Readonly<{ path: string }>>('=');
  });

  test('shows the rest of the path in the pattern', () => {
    assert.strictEqual(routes.docs.article.pattern, '/docs/:path*');
  });

  test('matches the rest of the path, one segment or more', () => {
    assert.deepStrictEqual<unknown>(
      matchRoutes(routes, { pathname: '/docs/guide/routing/links/' }),
      {
        route: 'docs.article',
        params: { path: ['guide', 'routing', 'links'] },
        search: {},
      },
    );

    // The parent's own path is the parent's page, not an empty rest.
    assert.deepStrictEqual<unknown>(
      matchRoutes(routes, { pathname: '/docs/' }),
      { route: 'docs', params: {}, search: {} },
    );
  });

  test('ranks below every static and dynamic sibling', () => {
    assert.strictEqual(
      matchRoutes(routes, { pathname: '/docs/new/' }).route,
      'docs.new',
    );

    assert.strictEqual(
      matchRoutes(routes, { pathname: '/docs/intro/' }).route,
      'docs.item',
    );

    // Two segments: the static and dynamic siblings end after one.
    assert.strictEqual(
      matchRoutes(routes, { pathname: '/docs/new/draft/' }).route,
      'docs.article',
    );
  });

  test('decodes each segment, keeping "/", "%" and non-ASCII inside it', () => {
    assert.deepStrictEqual<unknown>(
      matchRoutes(routes, {
        pathname: '/docs/a%2Fb/100%25/%E6%97%A5%E6%9C%AC/',
      }),
      {
        route: 'docs.article',
        params: { path: ['a/b', '100%', '日本'] },
        search: {},
      },
    );
  });

  test('a custom codec can refuse the segments, so the path does not match', () => {
    assert.deepStrictEqual<unknown>(
      matchRoutes(routes, { pathname: '/files/a/b/' }),
      { route: 'files.item', params: { path: 'a/b' }, search: {} },
    );

    assert.isUndefined(
      matchRoutes(routes, { pathname: '/files/a/secret/' }).route,
    );
  });

  test('href encodes each segment and reads back', () => {
    const href = routes.docs.article.href({ path: ['a/b', '100%', '日本'] });

    assert.strictEqual(href, '/docs/a%2Fb/100%25/%E6%97%A5%E6%9C%AC/');

    assert.deepStrictEqual<unknown>(matchRoutes(routes, { pathname: href }), {
      route: 'docs.article',
      params: { path: ['a/b', '100%', '日本'] },
      search: {},
    });

    assert.strictEqual(
      routes.files.item.href({ path: 'x/y/z' }),
      '/files/x/y/z/',
    );
  });

  test('href throws on a segment that cannot be one', () => {
    assert.throws(
      () => routes.docs.article.href({ path: ['a', ''] }),
      /docs\.article\.href: params\.path \(""\) cannot be a path segment/u,
    );

    assert.throws(
      () => routes.docs.article.href({ path: ['..'] }),
      /cannot be a path segment/u,
    );

    assert.throws(
      () => routes.files.item.href({ path: 'a/secret' }),
      /rejected by its own codec/u,
    );
  });

  test('href throws when the path resolves to a sibling that ranks first', () => {
    assert.throws(
      () => routes.docs.article.href({ path: ['new'] }),
      /resolves to docs\.new, not to docs\.article/u,
    );
  });

  test('rejects a rest node with children by type', () => {
    expectType<typeof _invalidRestTrees, () => void>('=');
  });

  test("the router's match keeps the segments' array when they are the same", () => {
    const router = createRouter(routes, {
      browser: createMemoryBrowser('https://example.com/docs/a/b/'),
    });

    const before = router.match.getSnapshot().value;

    router.push(routes.docs.article.href({ path: ['a', 'b'] }, { hash: 'x' }));

    const after = router.match.getSnapshot().value;

    assert.isTrue(
      before.route === 'docs.article' &&
        after.route === 'docs.article' &&
        before.params.path === after.params.path,
    );

    router.dispose();
  });

  test('defineRoutes rejects a rest node with children, even none', () => {
    assert.throws(
      () =>
        define({
          docs: { params: { path: param.rest }, children: { edit: {} } },
        }),
      /docs: a param\.rest node ends its branch and has no children/u,
    );

    assert.throws(
      () => define({ docs: { params: { path: param.rest }, children: {} } }),
      /docs: a param\.rest node ends its branch and has no children/u,
    );
  });

  test('defineRoutes rejects two rest nodes at one level', () => {
    assert.throws(
      () =>
        define({
          a: { params: { x: param.rest } },
          b: { params: { y: param.rest } },
        }),
      /a and b are rest segments at the same level under \//u,
    );
  });

  test('a rest node beside a dynamic one is not ambiguous', () => {
    assert.doesNotThrow(() =>
      define({
        a: { params: { x: param.string } },
        b: { params: { y: param.rest } },
      }),
    );
  });
});
