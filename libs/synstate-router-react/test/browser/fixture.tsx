import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  param,
  search,
  type MemoryBrowser,
  type Router,
} from 'synstate-router';
import { createReactRouter, type ReactRouter } from '../../src/index.mjs';

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
  bound: ReactRouter<Routes>;
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

  return { browser, router, bound: createReactRouter(router) };
};

/**
 * {@link setup} on a memory browser that scrolls to the test document's own
 * elements, and observes that document as the real browser does.
 */
export const setupWithDocument = (path: string): Fixture => {
  const start = new URL(path, globalThis.location.origin);

  const browser = createMemoryBrowser(start.href, {
    hasElement: (id) => document.querySelector(`#${CSS.escape(id)}`) !== null,
    // The document part of the real window's `observeDocument`, which is
    // internal to synstate-router: a test of it would need the test page's own
    // history.
    observeDocument: ({ changed }) => {
      const observer = new MutationObserver(() => {
        changed();
      });

      observer.observe(document, {
        childList: true,
        subtree: true,
        attributeFilter: ['id'],
      });

      return () => {
        observer.disconnect();
      };
    },
  });

  const router = createRouter(routes, { browser });

  return { browser, router, bound: createReactRouter(router) };
};

/** Waits for a later task, where the memory browser fires `popstate`. */
export const nextTask = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};
