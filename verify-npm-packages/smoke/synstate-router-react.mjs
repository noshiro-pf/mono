import * as assert from 'node:assert/strict';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  param,
} from 'synstate-router';
import { createReactRouter } from 'synstate-router-react';

// The components and hooks need a renderer to call, so this checks the module
// loads under its peer dependencies and binds a router to what it advertises.

const routes = defineRoutes({
  home: { segment: '' },
  products: { children: { item: { params: { productId: param.int } } } },
});

const router = createRouter(routes, {
  browser: createMemoryBrowser('https://example.com/products/42/'),
});

const bound = createReactRouter(router);

assert.deepEqual(Object.keys(bound).toSorted(), [
  'Link',
  'Routes',
  'useAt',
  'useIsActive',
  'useRouteMatch',
]);

console.info('synstate-router-react: ok');
