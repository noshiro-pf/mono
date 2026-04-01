import { defineRoutes, param } from './define-routes.mjs';
import {
  collectRouteNodes,
  fallback,
  route,
  routeMatch,
} from './route-match.mjs';

describe('routeMatch', () => {
  const routes = defineRoutes({
    home: { segment: '' },
    products: {
      children: {
        item: {
          params: { productId: param.path.string },
        },
      },
    },
    settings: {},
  });

  test('matches a static route and calls handler', () => {
    const result = routeMatch(
      ['settings'],
      [
        route(routes.settings, () => 'settings-page'),
        route(routes.products, () => 'products-page'),
        fallback(() => 'not-found'),
      ],
    );

    assert.strictEqual(result, 'settings-page');
  });

  test('matches a dynamic route and passes params to handler', () => {
    const result = routeMatch(
      ['products', '42'],
      [
        route(routes.products.item, ({ productId }) => `product-${productId}`),
        route(routes.products, () => 'products-page'),
        fallback(() => 'not-found'),
      ],
    );

    assert.strictEqual(result, 'product-42');
  });

  test('falls back when no route matches', () => {
    const result = routeMatch(
      ['unknown'],
      [
        route(routes.products, () => 'products-page'),
        fallback(() => 'not-found'),
      ],
    );

    assert.strictEqual(result, 'not-found');
  });

  test('matches in declaration order (first match wins)', () => {
    const result = routeMatch(
      ['products', '99'],
      [
        route(routes.products.item, ({ productId }) => `detail-${productId}`),
        route(routes.products, () => 'list'),
        fallback(() => 'not-found'),
      ],
    );

    assert.strictEqual(result, 'detail-99');
  });

  test('matches home (empty segment)', () => {
    const result = routeMatch(
      [],
      [
        route(routes.home, () => 'home-page'),
        route(routes.products, () => 'products-page'),
        fallback(() => 'not-found'),
      ],
    );

    assert.strictEqual(result, 'home-page');
  });

  test('prefix mode matches parent for deeper paths', () => {
    const result = routeMatch(
      ['products', '42'],
      [
        route(routes.products, () => 'products-area'),
        route(routes.settings, () => 'settings-area'),
        fallback(() => 'not-found'),
      ],
      { matchMode: 'prefix' },
    );

    assert.strictEqual(result, 'products-area');
  });
});

describe('collectRouteNodes', () => {
  const routes = defineRoutes({
    home: { segment: '' },
    products: {
      children: {
        item: {
          params: { productId: param.path.string },
        },
      },
    },
    settings: {},
  });

  test('collects all route nodes from the tree', () => {
    const nodes = collectRouteNodes(routes);

    const patterns = new Set(nodes.map((n) => n.pattern));

    assert.isTrue(patterns.has('/products/:productId'));

    assert.isTrue(patterns.has('/products'));

    assert.isTrue(patterns.has('/settings'));

    assert.isTrue(patterns.has('/'));
  });

  test('sorts deeper routes first', () => {
    const nodes = collectRouteNodes(routes);

    const patterns = nodes.map((n) => n.pattern);

    const productItemIdx = patterns.indexOf('/products/:productId');

    const productIdx = patterns.indexOf('/products');

    assert.isTrue(productItemIdx < productIdx);
  });
});
