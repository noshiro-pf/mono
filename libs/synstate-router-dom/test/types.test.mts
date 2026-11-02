// cspell:ignore setings
import { createState } from 'synstate';
import { Fragment, type JSX } from 'synstate-dom';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  param,
} from 'synstate-router';
import { expectType } from 'ts-data-forge';
import { createRouterComponents } from '../src/index.mjs';

const routes = defineRoutes({
  home: { segment: '' },
  products: {
    children: { item: { params: { productId: param.int } } },
  },
  settings: {},
});

const { Routes, Link } = createRouterComponents(
  createRouter(routes, {
    browser: createMemoryBrowser('https://example.com/'),
  }),
);

const home = (): JSX.Element => Fragment({});

// Never called: the calls are for the type checker.
const _mistakes = (path: string): void => {
  Routes({
    // @ts-expect-error A page without a case: `settings` is missing.
    cases: {
      home,
      products: home,
      'products.item': home,
    },
  });

  Routes({
    cases: {
      home,
      products: home,
      'products.item': home,
      settings: home,
      // @ts-expect-error A case for no page.
      setings: home,
    },
  });

  // Under a node, its branch alone is required.
  Routes({
    under: routes.products,
    cases: {
      products: home,
      'products.item': home,
    },
  });

  Routes({
    under: routes.products,
    cases: {
      products: home,
      'products.item': home,
      // @ts-expect-error Outside the branch.
      settings: home,
    },
  });

  // With prefix, a case per top-level node.
  Routes({
    prefix: true,
    cases: { home: undefined, products: home, settings: undefined },
  });

  // @ts-expect-error A hand-written path is not an Href.
  Link({ to: '/settings/' });

  // @ts-expect-error Nor is a string variable.
  Link({ to: path });

  // @ts-expect-error Nor an observable of strings.
  Link({ to: createState('/settings/')[0] });
};

describe('types', () => {
  test('Routes requires every page; Link takes an Href or an ExternalHref', () => {
    expectType<typeof _mistakes, (path: string) => void>('=');
  });
});
