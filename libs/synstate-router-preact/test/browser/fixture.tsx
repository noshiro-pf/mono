import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  param,
  search,
  type MemoryBrowser,
  type Router,
} from 'synstate-router';
import { createPreactRouter, type PreactRouter } from '../../src/index.mjs';

export const routes = defineRoutes({
  home: { segment: '' },
  products: {
    search: { page: search.int({ default: 1 }), q: search.string() },
    children: {
      new: {},
      item: { params: { productId: param.int } },
    },
  },
  settings: {},
  drafts: {},
});

export type Routes = typeof routes;

export type Fixture = Readonly<{
  browser: MemoryBrowser;
  router: Router<Routes>;
  bound: PreactRouter<Routes>;
}>;

/**
 * A router on a memory browser at the test page's origin, so that an anchor's
 * `href`, which the document resolves against that origin, is one the router
 * accepts.
 */
export const setup = (path: string): Fixture => {
  const start = new URL(path, globalThis.location.origin);

  const browser = createMemoryBrowser(start.href);

  const router = createRouter(routes, { browser });

  return { browser, router, bound: createPreactRouter(router) };
};

/** Waits for a later task, where the memory browser fires `popstate`. */
export const nextTask = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};
