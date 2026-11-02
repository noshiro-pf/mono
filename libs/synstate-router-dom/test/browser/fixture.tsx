import { render, type JSX } from 'synstate-dom';
import {
  createMemoryBrowser,
  createRouter,
  defineRoutes,
  param,
  search,
  type MemoryBrowser,
  type Router,
} from 'synstate-router';
import {
  createRouterComponents,
  type RouterComponents,
} from '../../src/index.mjs';

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
  bound: RouterComponents<Routes>;
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

  return { browser, router, bound: createRouterComponents(router) };
};

/** Mounts `app` into a container attached to the document. */
export const mountInto = (
  app: () => JSX.Element,
): Readonly<{ container: HTMLDivElement; unmount: () => void }> => {
  const container = document.createElement('div');

  document.body.append(container);

  const unmount = render(app, container);

  return {
    container,
    unmount: () => {
      unmount();

      container.remove();
    },
  };
};

/** Waits for a later task, where the memory browser fires `popstate`. */
export const nextTask = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

/** Lets the work queued for after an update run. */
export const afterUpdate = async (): Promise<void> => {
  await Promise.resolve();
};
