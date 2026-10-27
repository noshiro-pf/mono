/* eslint-disable unicorn/prefer-global-this */
import { createState, map, type InitializedObservable } from 'synstate';
import { castMutable, pipe } from 'ts-data-forge';
import type { DeepReadonly, StrictOmit } from 'ts-type-forge';
import {
  normalizeBasePath,
  prependBasePath,
  stripBasePath,
} from './base-path.mjs';

/**
 * @param sortParams - Sort query params by key. Default is true.
 * @param method - Method to update query params. Default is 'pushState'.
 */
export type UpdateQueryParamsOptions = Partial<
  Readonly<{
    sortParams: boolean;
    method: 'pushState' | 'replaceState';
  }>
>;

export type ReadonlyURLSearchParams = DeepReadonly<
  StrictOmit<URLSearchParams, 'append' | 'delete' | 'set' | 'sort'>
>;

export type RouterState = Readonly<{
  /**
   * `window.location.pathname`, below `RouterOptions.basePath` — `/career/`
   * for `/mono/profile/career/` when the base path is `/mono/profile/`.
   */
  pathname: string;

  /** `splitToPathSegments(pathname)` */
  pathSegments: readonly string[];

  /**
   * Query parameters created from `(new
   * URL(window.location.href)).searchParams`. Mutation methods (`append`,
   * `delete`, `set`, `sort` of `URLSearchParams`) are omitted .
   */
  searchParams: ReadonlyURLSearchParams;
}>;

export type Router = Readonly<{
  state: InitializedObservable<RouterState>;

  push: (nextUrl: string) => void;

  redirect: (nextUrl: string) => void;

  go: (delta?: number) => void;

  forward: () => void;

  back: () => void;

  updateQueryParams: (
    recipe: (draft: URLSearchParams) => URLSearchParams,
    options?: UpdateQueryParamsOptions,
  ) => void;

  removeListener: () => void;

  utils: Readonly<{
    splitToPathSegments: (pathname: string) => readonly string[];
    withSlash: (path: string) => string;
  }>;
}>;

export type RouterOptions = Readonly<{
  /**
   * The path the app is served under, e.g. `/mono/profile/` — pass
   * `import.meta.env.BASE_URL` from a Vite app. Defaults to `/`.
   *
   * Every path the router hands out or takes in is below it: `state.pathname`
   * has it stripped, and `push`, `redirect` and the `redirect` option put a
   * root-relative path (`/career/`) back under it. So an app routes as if it
   * were served at the root, wherever it is deployed. A whole URL, such as a
   * clicked link's `href`, is taken as it is.
   */
  basePath?: string;

  /**
   * The path to replace `pathname` with, or `undefined` to keep it. It is
   * applied to every URL before `state` shows it — the first one included —
   * so that nobody has to redirect from a subscriber of `state`, which would
   * be a write while its update propagates.
   */
  redirect?: (pathname: string) => string | undefined;
}>;

/**
 * Creates pathname Observable and queryParams Observable, and starts listening
 * URL changes.
 */
export const createRouter = (routerOptions?: RouterOptions): Router => {
  const basePath = normalizeBasePath(routerOptions?.basePath ?? '/');

  const getCurrentUrl = (): URL => new URL(window.location.href);

  /** The current URL, redirected first if `routerOptions.redirect` asks for it. */
  const readUrl = (): URL => {
    const to = routerOptions?.redirect?.(
      stripBasePath(basePath, window.location.pathname),
    );

    if (to !== undefined) {
      window.history.replaceState(
        {},
        '',
        withSlash(prependBasePath(basePath, to)),
      );
    }

    return getCurrentUrl();
  };

  const [url$, setUrl] = createState<URL>(readUrl());

  const state = url$.pipe(
    map((a) => {
      const pathname = stripBasePath(basePath, a.pathname);

      return {
        pathname,
        searchParams: a.searchParams,
        pathSegments: splitToPathSegments(pathname),
      };
    }),
  );

  const updateState = (): void => {
    setUrl(readUrl());
  };

  const updateQueryParams = (
    recipe: (draft: URLSearchParams) => URLSearchParams,
    options?: UpdateQueryParamsOptions,
  ): void => {
    const mut_url = castMutable(getCurrentUrl());

    const { sortParams = true, method = 'pushState' } = options ?? {};

    const prev = mut_url.searchParams.toString();

    const nextSearchParams = pipe(mut_url.searchParams)
      .map(recipe)
      .map(
        sortParams
          ? (a) => {
              a.sort();

              return a;
            }
          : (a) => a,
      )
      .map((a) => a.toString()).value;

    if (nextSearchParams === prev) {
      return;
    }

    mut_url.search = nextSearchParams;

    switch (method) {
      case 'pushState':
        push(mut_url.toString());

        break;

      case 'replaceState':
        redirect(mut_url.toString());

        break;
    }
  };

  const push = (nextUrl: string, appendSlash: boolean = true): void => {
    const url = prependBasePath(basePath, nextUrl);

    window.history.pushState({}, '', appendSlash ? withSlash(url) : url);

    updateState();
  };

  const redirect = (nextUrl: string, appendSlash: boolean = true): void => {
    const url = prependBasePath(basePath, nextUrl);

    window.history.replaceState({}, '', appendSlash ? withSlash(url) : url);

    updateState();
  };

  const go = (delta?: number): void => {
    window.history.go(delta);

    updateState();
  };

  const forward = (): void => {
    window.history.forward();

    updateState();
  };

  const back = (): void => {
    window.history.back();

    updateState();
  };

  // initialize
  globalThis.addEventListener('popstate', updateState);

  return {
    state,
    push,
    redirect,
    go,
    forward,
    back,
    updateQueryParams,
    removeListener: () => {
      globalThis.removeEventListener('popstate', updateState);
    },
    utils: { splitToPathSegments, withSlash },
  };
};

/**
 * Normalizes a path so it ends in a slash, moving a query string after it.
 *
 * Exported as well as reachable through `Router.utils`, so that a caller who
 * only needs this pure transformation does not have to construct a router —
 * `createRouter` reads `window.location` at call time, which a Node test
 * cannot do.
 */
export const withSlash = (path: string): string =>
  path.endsWith('/') || path.includes('/?')
    ? path
    : path.includes('?')
      ? path.replaceAll('?', '/?')
      : (`${path}/` as const);

const splitToPathSegments = (pathname: string): readonly string[] =>
  pathname.split('/').filter((s) => s !== '');
