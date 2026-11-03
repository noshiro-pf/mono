import {
  createRouter,
  defineRoutes,
  param,
  search,
  type PageMatchOf,
  type PageValues,
} from 'synstate-router';
import { createReactRouter } from 'synstate-router-react';
import { firstPage, isPageNumber } from './page-number.mjs';

/**
 * Every page of the app. The path of a node is its key unless `segment` says
 * otherwise; `children` nest below it.
 */
export const routes = defineRoutes({
  home: { segment: '' },
  products: {
    search: {
      // `?q=` reads as `''`; the search box writes an empty query as absent.
      q: search.string(),
      // Anything but these two reads as the default.
      sort: search.literal(['name', 'price'], { default: 'name' }),
      // `?page=0` or `?page=x` reads as page 1.
      page: search.refine(search.int(), isPageNumber, { default: firstPage }),
    },
    children: {
      // `/products/abc/` does not match: the param is not an integer.
      item: { params: { productId: param.int } },
    },
  },
  settings: {
    children: {
      profile: {},
      notifications: {},
    },
  },
});

export type Routes = typeof routes;

export const router = createRouter(routes, {
  // `/settings/` has no page of its own: it leads to the first tab.
  redirect: (m) =>
    m.route === 'settings' ? routes.settings.profile.href() : undefined,
});

export const { Routes, Link, useIsActive } = createReactRouter(router);

/** What the product list page receives. */
export type ProductListValues = PageValues<PageMatchOf<Routes, 'products'>>;
