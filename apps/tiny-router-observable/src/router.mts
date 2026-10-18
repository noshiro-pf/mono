/* eslint-disable unicorn/prefer-global-this */
import { createState, map, type InitializedObservable } from 'synstate';
import { castMutable, pipe } from 'ts-data-forge';
import type { DeepReadonly, StrictOmit } from 'ts-type-forge';

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
  /** `(new URL(window.location.href)).searchParams` */
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
  const getCurrentUrl = (): URL => new URL(window.location.href);

  /** The current URL, redirected first if `routerOptions.redirect` asks for it. */
  const readUrl = (): URL => {
    const to = routerOptions?.redirect?.(window.location.pathname);

    if (to !== undefined) {
      window.history.replaceState({}, '', withSlash(to));
    }

    return getCurrentUrl();
  };

  const [url$, setUrl] = createState<URL>(readUrl());

  const state = url$.pipe(
    map((a) => ({
      pathname: a.pathname,
      searchParams: a.searchParams,
      pathSegments: splitToPathSegments(a.pathname),
    })),
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
    window.history.pushState(
      {},
      '',
      appendSlash ? withSlash(nextUrl) : nextUrl,
    );

    updateState();
  };

  const redirect = (nextUrl: string, appendSlash: boolean = true): void => {
    window.history.replaceState(
      {},
      '',
      appendSlash ? withSlash(nextUrl) : nextUrl,
    );

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
