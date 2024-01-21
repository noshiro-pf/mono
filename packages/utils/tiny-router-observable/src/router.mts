import {
  createState,
  mapI,
  type InitializedObservable,
} from '@noshiro/syncflow';
import { castWritable, pipe } from '@noshiro/ts-utils';

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
  Omit<URLSearchParams, 'append' | 'delete' | 'set' | 'sort'>
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
  state$: InitializedObservable<RouterState>;

  push: (nextUrl: string) => void;

  redirect: (nextUrl: string) => void;

  go: (delta?: number | undefined) => void;

  forward: () => void;

  back: () => void;

  updateQueryParams: (
    recipe: (draft: URLSearchParams) => URLSearchParams,
    options?: UpdateQueryParamsOptions,
  ) => void;

  removeListener: () => void;

  utils: {
    splitToPathSegments: (pathname: string) => readonly string[];
    withSlash: (path: string) => string;
  };
}>;

/**
 * Creates pathname Observable and queryParams Observable, and starts listening
 * URL changes.
 */
export const createRouter = (): Router => {
  const getCurrentUrl = (): URL => new URL(window.location.href);

  const { state$: url$, setState: setUrl } = createState<URL>(getCurrentUrl());

  const state$ = url$.chain(
    mapI((a) => ({
      pathname: a.pathname,
      searchParams: a.searchParams,
      pathSegments: splitToPathSegments(a.pathname),
    })),
  );

  const updateState = (): void => {
    setUrl(getCurrentUrl());
  };

  const updateQueryParams = (
    recipe: (draft: URLSearchParams) => URLSearchParams,
    options?: UpdateQueryParamsOptions,
  ): void => {
    const mut_url = castWritable(getCurrentUrl());

    const { sortParams = true, method = 'pushState' } = options ?? {};

    const prev = mut_url.searchParams.toString();

    const nextSearchParams = pipe(mut_url.searchParams)
      .chain(recipe)
      .chain(
        sortParams
          ? (a) => {
              a.sort();
              return a;
            }
          : (a) => a,
      )
      .chain((a) => a.toString()).value;

    if (nextSearchParams === prev) return;

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

  const go = (delta?: number | undefined): void => {
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
  window.addEventListener('popstate', updateState);

  return {
    state$,
    push,
    redirect,
    go,
    forward,
    back,
    updateQueryParams,
    removeListener: () => {
      window.removeEventListener('popstate', updateState);
    },
    utils: { splitToPathSegments, withSlash },
  };
};

const withSlash = (path: string): string =>
  path.endsWith('/')
    ? path
    : path.includes('/?')
      ? path
      : path.includes('?')
        ? path.split('?').join('/?')
        : `${path}/`;

const splitToPathSegments = (pathname: string): readonly string[] =>
  pathname.split('/').filter((s) => s !== '');
