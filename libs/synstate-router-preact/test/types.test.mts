// cspell:ignore setings
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  param,
} from 'synstate-router';
import { expectType } from 'ts-data-forge';
import { createPreactRouter } from '../src/index.mjs';

const routes = defineRoutes({
  home: { segment: '' },
  products: {
    children: { item: { params: { productId: param.int } } },
  },
  settings: {},
});

const { Routes, Link } = createPreactRouter(
  createRouter(routes, {
    browser: createMemoryBrowser('https://example.com/'),
  }),
);

// Never called: the calls are for the type checker.
const _mistakes = (path: string): void => {
  Routes({
    // @ts-expect-error A page without a case: `settings` is missing.
    cases: {
      home: () => 'home',
      products: () => 'products',
      'products.item': () => 'item',
    },
  });

  Routes({
    cases: {
      home: () => 'home',
      products: () => 'products',
      'products.item': () => 'item',
      settings: () => 'settings',
      // @ts-expect-error A case for no page.
      setings: () => 'typo',
    },
  });

  // Under a node, its branch alone is required.
  Routes({
    under: routes.products,
    cases: {
      products: () => 'list',
      'products.item': () => 'item',
    },
  });

  Routes({
    under: routes.products,
    cases: {
      products: () => 'list',
      'products.item': () => 'item',
      // @ts-expect-error Outside the branch.
      settings: () => 'settings',
    },
  });

  // With prefix, a case per top-level node.
  Routes({
    prefix: true,
    cases: { home: undefined, products: () => 'layout', settings: undefined },
  });

  // @ts-expect-error A hand-written path is not an Href.
  Link({ to: '/settings/' });

  // @ts-expect-error Nor is a string variable.
  Link({ to: path });
};

describe('types', () => {
  test('Routes requires every page; Link takes an Href or an ExternalHref', () => {
    expectType<typeof _mistakes, (path: string) => void>('=');
  });
});
