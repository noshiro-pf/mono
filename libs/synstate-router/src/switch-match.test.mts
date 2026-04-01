import { defineRoutes, param } from './define-routes.mjs';
import { switchMatch } from './switch-match.mjs';

describe('switchMatch', () => {
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
      children: {
        item: {
          params: { userId: param.path.string },
        },
      },
    },
    settings: {},
  });

  describe('exact mode (default)', () => {
    test('matches first exact route', () => {
      const result = switchMatch(
        [
          routes.products.item.reviews.item,
          routes.products.item,
          routes.products,
        ],
        ['products', '123'],
      );

      assert.strictEqual(result.route, '/products/:productId');

      assert.deepStrictEqual(result.params, { productId: '123' });
    });

    test('matches deeper route before shallower', () => {
      const result = switchMatch(
        [
          routes.products.item.reviews.item,
          routes.products.item,
          routes.products,
        ],
        ['products', '123', 'reviews', '456'],
      );

      assert.strictEqual(
        result.route,
        '/products/:productId/reviews/:reviewId',
      );

      assert.deepStrictEqual(result.params, {
        productId: '123',
        reviewId: '456',
      });
    });

    test('matches static route', () => {
      const result = switchMatch(
        [routes.products, routes.settings],
        ['settings'],
      );

      assert.strictEqual(result.route, '/settings');

      assert.deepStrictEqual(result.params, {});
    });

    test('returns undefined route when nothing matches', () => {
      const result = switchMatch(
        [routes.products, routes.settings],
        ['unknown'],
      );

      assert.strictEqual(result.route, undefined);

      assert.deepStrictEqual(result.params, {});
    });

    test('does not match prefix in exact mode', () => {
      const result = switchMatch([routes.products], ['products', '123']);

      assert.strictEqual(result.route, undefined);
    });
  });

  describe('prefix mode', () => {
    test('matches prefix', () => {
      const result = switchMatch(
        [routes.products, routes.users, routes.settings],
        ['products', '123', 'reviews', '456'],
        { matchMode: 'prefix' },
      );

      assert.strictEqual(result.route, '/products');

      assert.deepStrictEqual(result.params, {});
    });

    test('matches first prefix in order', () => {
      const result = switchMatch(
        [routes.products, routes.users],
        ['users', 'abc'],
        { matchMode: 'prefix' },
      );

      assert.strictEqual(result.route, '/users');

      assert.deepStrictEqual(result.params, {});
    });

    test('returns undefined when no prefix matches', () => {
      const result = switchMatch(
        [routes.products, routes.settings],
        ['unknown', 'path'],
        { matchMode: 'prefix' },
      );

      assert.strictEqual(result.route, undefined);
    });
  });
});
