import { asSafeInt, expectType } from 'ts-data-forge';
import type { RelaxedExtract } from 'ts-type-forge';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  matchedBranch,
  matchRoutes,
  param,
  search,
  type Href,
  type RouteBranch,
  type RouteBranchEntry,
  type RouteDefinitions,
} from '../src/index.mjs';

type Crumb = Readonly<{ label: string }>;

const routes = defineRoutes({
  home: { segment: '', meta: { label: 'Home' } satisfies Crumb },
  products: {
    meta: { label: 'Products' } as const,
    search: { page: search.int({ default: 1 }) },
    children: {
      item: {
        params: { productId: param.int },
        meta: { label: 'Product', tab: 'detail' } as const,
        children: {
          reviews: {
            page: false,
            meta: { label: 'Reviews' } satisfies Crumb,
            children: {
              item: { params: { reviewId: param.string } },
            },
          },
        },
      },
    },
  },
  users: {
    meta: { label: 'Users' } satisfies Crumb,
    children: {
      new: { meta: { label: 'New user' } satisfies Crumb },
      item: {
        params: { userId: param.string },
        meta: { label: 'User' } satisfies Crumb,
        children: { posts: { meta: { label: 'Posts' } satisfies Crumb } },
      },
    },
  },
});

type Routes = typeof routes;

const define = (definition: RouteDefinitions): unknown =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the run-time check is under test, not the type
  defineRoutes(definition as never);

describe('meta', () => {
  test("is a node's own data, keeping the type written", () => {
    expectType<
      typeof routes.products.item.meta,
      Readonly<{ label: 'Product'; tab: 'detail' }>
    >('=');

    expectType<typeof routes.products.meta, Readonly<{ label: 'Products' }>>(
      '=',
    );

    expectType<typeof routes.products.item.reviews.item.meta, undefined>('=');

    assert.deepStrictEqual(routes.products.item.meta, {
      label: 'Product',
      tab: 'detail',
    });

    assert.isUndefined(routes.products.item.reviews.item.meta);
  });

  test('is a reserved key', () => {
    assert.throws(
      () => define({ a: { children: { meta: {} } } }),
      /the key of a\.meta \("meta"\) is reserved/u,
    );
  });
});

describe(matchedBranch, () => {
  test('lists the matched nodes root first, with their meta and href', () => {
    const m = matchRoutes(routes, {
      pathname: '/products/42/reviews/abc/',
      search: 'page=3',
    });

    assert.deepStrictEqual<unknown>(matchedBranch(routes, m), [
      {
        id: 'products',
        meta: { label: 'Products' },
        href: '/products/',
      },
      {
        id: 'products.item',
        meta: { label: 'Product', tab: 'detail' },
        href: '/products/42/',
      },
      // `page: false`: no page to link to.
      {
        id: 'products.item.reviews',
        meta: { label: 'Reviews' },
        href: undefined,
      },
      {
        id: 'products.item.reviews.item',
        meta: undefined,
        href: '/products/42/reviews/abc/',
      },
    ]);
  });

  test('is empty when no page matched', () => {
    assert.deepStrictEqual(
      matchedBranch(routes, matchRoutes(routes, { pathname: '/nowhere/' })),
      [],
    );
  });

  test("leaves out the href of a node whose own URL is another page's", () => {
    // `/users/new/posts/` backtracks to `users.item` with `userId = 'new'`, but
    // `/users/new/` is `users.new`.
    const m = matchRoutes(routes, { pathname: '/users/new/posts/' });

    assert.deepStrictEqual<unknown>(
      matchedBranch(routes, m).map(({ id, href }) => ({ id, href })),
      [
        { id: 'users', href: '/users/' },
        { id: 'users.item', href: undefined },
        { id: 'users.item.posts', href: '/users/new/posts/' },
      ],
    );
  });

  test('an entry narrowed by its id has the meta of that node', () => {
    type Entry = RelaxedExtract<
      RouteBranchEntry<Routes>,
      Readonly<{ id: 'products.item' }>
    >;

    expectType<
      Entry,
      Readonly<{
        id: 'products.item';
        meta: Readonly<{ label: 'Product'; tab: 'detail' }>;
        href: Href | undefined;
      }>
    >('=');

    type Reviews = RelaxedExtract<
      RouteBranchEntry<Routes>,
      Readonly<{ id: 'products.item.reviews' }>
    >;

    expectType<Reviews['href'], undefined>('=');
  });
});

describe('router.branch', () => {
  test('follows the match, keeping its references while it stays the same', () => {
    const router = createRouter(routes, {
      browser: createMemoryBrowser('https://example.com/products/1/'),
    });

    // The same observable each time it is read.
    assert.strictEqual(router.branch, router.branch);

    const first = router.branch.getSnapshot().value;

    expectType<typeof first, RouteBranch<Routes>>('=');

    assert.deepStrictEqual(
      first.map(({ id }) => id),
      ['products', 'products.item'],
    );

    // The search alone changed: the branch is the same.
    router.setSearch(routes.products, () => ({ page: asSafeInt(2) }));

    assert.strictEqual(router.branch.getSnapshot().value, first);

    router.push(routes.users.href());

    assert.deepStrictEqual(
      router.branch.getSnapshot().value.map(({ id }) => id),
      ['users'],
    );

    router.dispose();
  });
});
