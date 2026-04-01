import { defineRoutes, param } from './define-routes.mjs';

describe('route matching', () => {
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

  const splitPath = (pathname: string): readonly string[] =>
    pathname.split('/').filter((s) => s.length > 0);

  describe('matchExact()', () => {
    test('matches static route exactly', () => {
      const result = routes.products.matchExact(splitPath('/products'));

      assert.deepStrictEqual(result, {});
    });

    test('does not match when path has extra segments', () => {
      const result = routes.products.matchExact(splitPath('/products/123'));

      assert.strictEqual(result, undefined);
    });

    test('matches dynamic route and extracts params', () => {
      const result = routes.products.item.matchExact(
        splitPath('/products/123'),
      );

      assert.deepStrictEqual(result, { productId: '123' });
    });

    test('does not match dynamic route with extra segments', () => {
      const result = routes.products.item.matchExact(
        splitPath('/products/123/reviews'),
      );

      assert.strictEqual(result, undefined);
    });

    test('matches deeply nested route', () => {
      const result = routes.products.item.reviews.item.matchExact(
        splitPath('/products/123/reviews/456'),
      );

      assert.deepStrictEqual(result, { productId: '123', reviewId: '456' });
    });

    test('does not match wrong prefix', () => {
      const result = routes.products.matchExact(splitPath('/users'));

      assert.strictEqual(result, undefined);
    });

    test('does not match empty path for non-root route', () => {
      const result = routes.products.matchExact(splitPath('/'));

      assert.strictEqual(result, undefined);
    });

    test('matches settings (leaf static route)', () => {
      const result = routes.settings.matchExact(splitPath('/settings'));

      assert.deepStrictEqual(result, {});
    });
  });

  describe('match() (prefix)', () => {
    test('matches exact path', () => {
      const result = routes.products.match(splitPath('/products'));

      assert.deepStrictEqual(result, {});
    });

    test('matches path with additional segments', () => {
      const result = routes.products.match(splitPath('/products/123'));

      assert.deepStrictEqual(result, {});
    });

    test('matches deeply nested path', () => {
      const result = routes.products.match(
        splitPath('/products/123/reviews/456'),
      );

      assert.deepStrictEqual(result, {});
    });

    test('extracts params for dynamic prefix match', () => {
      const result = routes.products.item.match(
        splitPath('/products/123/reviews/456'),
      );

      assert.deepStrictEqual(result, { productId: '123' });
    });

    test('does not match wrong prefix', () => {
      const result = routes.products.match(splitPath('/users'));

      assert.strictEqual(result, undefined);
    });

    test('does not match partial static segment', () => {
      const result = routes.products.match(splitPath('/prod'));

      assert.strictEqual(result, undefined);
    });
  });
});
