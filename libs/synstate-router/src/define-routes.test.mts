import { defineRoutes, param } from './define-routes.mjs';

describe('defineRoutes', () => {
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

  describe('pattern', () => {
    test('static segment', () => {
      assert.strictEqual(routes.products.pattern, '/products');
    });

    test('dynamic segment', () => {
      assert.strictEqual(routes.products.item.pattern, '/products/:productId');
    });

    test('deeply nested', () => {
      assert.strictEqual(
        routes.products.item.reviews.item.pattern,
        '/products/:productId/reviews/:reviewId',
      );
    });

    test('sibling routes', () => {
      assert.strictEqual(routes.users.pattern, '/users');

      assert.strictEqual(routes.users.item.pattern, '/users/:userId');

      assert.strictEqual(routes.settings.pattern, '/settings');
    });
  });

  describe('path()', () => {
    test('static route', () => {
      assert.strictEqual(routes.products.path(), '/products');
    });

    test('dynamic route with params', () => {
      assert.strictEqual(
        routes.products.item.path({ productId: '123' }),
        '/products/123',
      );
    });

    test('deeply nested route with multiple params', () => {
      assert.strictEqual(
        routes.products.item.reviews.item.path({
          productId: '123',
          reviewId: '456',
        }),
        '/products/123/reviews/456',
      );
    });

    test('static route with no params', () => {
      assert.strictEqual(routes.settings.path(), '/settings');
    });
  });

  describe('custom segment name', () => {
    const routesWithCustomSegment = defineRoutes({
      userProfiles: {
        segment: 'user-profiles',
        children: {
          item: {
            params: { profileId: param.path.string },
          },
        },
      },
    });

    test('uses custom segment instead of key name', () => {
      assert.strictEqual(
        routesWithCustomSegment.userProfiles.pattern,
        '/user-profiles',
      );
    });

    test('path generation uses custom segment', () => {
      assert.strictEqual(
        routesWithCustomSegment.userProfiles.item.path({ profileId: 'abc' }),
        '/user-profiles/abc',
      );
    });
  });
});
