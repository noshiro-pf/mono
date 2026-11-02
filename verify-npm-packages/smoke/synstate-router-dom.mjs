import * as assert from 'node:assert/strict';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  param,
} from 'synstate-router';
import { createRouterComponents } from 'synstate-router-dom';

// The components mount into a document, which Node does not have, so this
// checks the module loads under its peer dependencies and binds a router to
// what it advertises.

const routes = defineRoutes({
  home: { segment: '' },
  products: { children: { item: { params: { productId: param.int } } } },
});

const router = createRouter(routes, {
  browser: createMemoryBrowser('https://example.com/products/42/'),
});

const bound = createRouterComponents(router);

assert.deepEqual(Object.keys(bound).toSorted(), ['Link', 'Routes']);

console.info('synstate-router-dom: ok');
