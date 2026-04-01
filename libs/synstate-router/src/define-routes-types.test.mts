/**
 * Type-safety tests for defineRoutes.
 * These tests verify both runtime behavior AND compile-time type correctness.
 * If the types are wrong, `tsc --noEmit` will fail.
 */
import { expectType } from 'ts-data-forge';
import { defineRoutes, param } from './define-routes.mjs';
import { type CollectRouteEntries } from './route-types.mjs';

describe('defineRoutes type safety', () => {
  const routes = defineRoutes({
    products: {
      children: {
        item: {
          params: { productId: param.path.string },
          children: {
            reviews: {
              children: {
                item: {
                  params: { reviewId: param.path.string },
                },
              },
            },
          },
        },
      },
    },
    users: {
      queryParams: {
        page: param.query.number({ default: 1 }),
        role: param.query.string(),
      },
      children: {
        item: {
          params: { userId: param.path.string },
        },
      },
    },
    settings: {},
  });

  describe('pattern type', () => {
    test('pattern is a string', () => {
      const pattern: string = routes.products.pattern;

      assert.strictEqual(pattern, '/products');
    });
  });

  describe('path() params type', () => {
    test('static route: path() requires no arguments', () => {
      const p: string = routes.products.path();

      assert.strictEqual(p, '/products');
    });

    test('dynamic route: path() requires matching params', () => {
      const p: string = routes.products.item.path({ productId: '123' });

      assert.strictEqual(p, '/products/123');
    });

    test('nested dynamic: path() requires all accumulated params', () => {
      const p: string = routes.products.item.reviews.item.path({
        productId: '123',
        reviewId: '456',
      });

      assert.strictEqual(p, '/products/123/reviews/456');
    });

    test('sibling dynamic route', () => {
      const p: string = routes.users.item.path({ userId: 'abc' });

      assert.strictEqual(p, '/users/abc');
    });
  });

  describe('matchExact() return type', () => {
    test('static route returns empty object or undefined', () => {
      const result = routes.products.matchExact(['products']);

      assert.deepStrictEqual(result, {});
    });

    test('dynamic route returns params object', () => {
      const result = routes.products.item.matchExact(['products', '123']);

      if (result !== undefined) {
        // Type should be { productId: string }
        const id: string = result.productId;

        assert.strictEqual(id, '123');
      }
    });

    test('nested dynamic returns accumulated params', () => {
      const result = routes.products.item.reviews.item.matchExact([
        'products',
        '123',
        'reviews',
        '456',
      ]);

      if (result !== undefined) {
        const productId: string = result.productId;

        const reviewId: string = result.reviewId;

        assert.strictEqual(productId, '123');

        assert.strictEqual(reviewId, '456');
      }
    });
  });

  describe('queryParams type', () => {
    test('queryParams are accessible on the route node', () => {
      assert.isDefined(routes.users.queryParams.page);

      assert.isDefined(routes.users.queryParams.role);
    });
  });

  describe('type-level assertions', () => {
    test('path() param types are enforced', () => {
      // These type assertions verify compile-time behavior.
      // If the type is wrong, `tsc --noEmit` will fail.

      type ProductsPath = typeof routes.products.path;

      type ProductItemPath = typeof routes.products.item.path;

      type ReviewItemPath = typeof routes.products.item.reviews.item.path;

      // Static route: no params required
      expectType<ProductsPath, () => string>('=');

      // Dynamic route: requires { productId: string }
      expectType<
        ProductItemPath,
        (params: Readonly<{ productId: string }>) => string
      >('=');

      // Nested dynamic: requires accumulated params
      expectType<
        ReviewItemPath,
        (params: Readonly<{ productId: string; reviewId: string }>) => string
      >('=');
    });

    test('matchExact() return types are correct', () => {
      type ProductsMatchResult = ReturnType<typeof routes.products.matchExact>;

      type ItemMatchResult = ReturnType<typeof routes.products.item.matchExact>;

      type ReviewMatchResult = ReturnType<
        typeof routes.products.item.reviews.item.matchExact
      >;

      expectType<ProductsMatchResult, Readonly<{}> | undefined>('=');

      expectType<ItemMatchResult, Readonly<{ productId: string }> | undefined>(
        '=',
      );

      expectType<
        ReviewMatchResult,
        Readonly<{ productId: string; reviewId: string }> | undefined
      >('=');
    });

    test('pattern is a string literal type', () => {
      type ProductsPattern = typeof routes.products.pattern;

      type ItemPattern = typeof routes.products.item.pattern;

      type ReviewPattern = typeof routes.products.item.reviews.item.pattern;

      type SettingsPattern = typeof routes.settings.pattern;

      expectType<ProductsPattern, '/products'>('=');

      expectType<ItemPattern, '/products/:productId'>('=');

      expectType<ReviewPattern, '/products/:productId/reviews/:reviewId'>('=');

      expectType<SettingsPattern, '/settings'>('=');
    });

    test('CollectRouteEntries collects all patterns', () => {
      type Entries = CollectRouteEntries<typeof routes>;

      type Patterns = Entries['pattern'];

      expectType<'/products', Patterns>('<=');

      expectType<'/products/:productId', Patterns>('<=');

      expectType<'/users/:userId', Patterns>('<=');

      expectType<'/settings', Patterns>('<=');
    });
  });
});
