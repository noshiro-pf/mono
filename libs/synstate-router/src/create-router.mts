import { createState, map, type InitializedObservable } from 'synstate';
import { type QueryParamSerializer } from './query-param-serializer.mjs';
import {
  type DefineRoutesOutput,
  type RoutesDefInput,
} from './route-types.mjs';
import { splitToPathSegments } from './split-path-segments.mjs';

// --- Router state types ---

export type RouterState = Readonly<{
  pathname: string;
  pathSegments: readonly string[];
  searchParams: URLSearchParams;
}>;

type UpdateQueryParamsOptions = Readonly<{
  method?: 'pushState' | 'replaceState';
}>;

export type Router<D extends RoutesDefInput> = Readonly<{
  routes: DefineRoutesOutput<D>;
  state: InitializedObservable<RouterState>;
  pathname: InitializedObservable<string>;
  pathSegments: InitializedObservable<readonly string[]>;
  searchParams: InitializedObservable<URLSearchParams>;
  push: (path: string) => void;
  redirect: (path: string) => void;
  back: () => void;
  forward: () => void;
  go: (delta?: number) => void;
  getPathSegments: () => readonly string[];
  updateQueryParams: (
    recipe: (params: URLSearchParams) => void,
    options?: UpdateQueryParamsOptions,
  ) => void;
  getQueryParam: <T>(serializer: QueryParamSerializer<T>) => T | undefined;
  setQueryParam: <T>(
    serializer: QueryParamSerializer<T>,
    value: T,
    options?: UpdateQueryParamsOptions,
  ) => void;
  deleteQueryParam: <T>(
    serializer: QueryParamSerializer<T>,
    options?: UpdateQueryParamsOptions,
  ) => void;
  dispose: () => void;
}>;

// --- createRouter ---

export const createRouter = <const D extends RoutesDefInput>(
  routes: DefineRoutesOutput<D>,
): Router<D> => {
  const [url, setUrl] = createState(new URL(globalThis.window.location.href));

  const state = url.pipe(
    map(
      (u): RouterState => ({
        pathname: u.pathname,
        pathSegments: splitToPathSegments(u.pathname),
        searchParams: u.searchParams,
      }),
    ),
  );

  const pathname = state.pipe(map((s) => s.pathname));

  const pathSegments = state.pipe(map((s) => s.pathSegments));

  const searchParams = state.pipe(map((s) => s.searchParams));

  const syncFromLocation = (): void => {
    setUrl(new URL(globalThis.window.location.href));
  };

  const handlePopState = (): void => {
    syncFromLocation();
  };

  globalThis.window.addEventListener('popstate', handlePopState);

  const push = (path: string): void => {
    globalThis.window.history.pushState(null, '', path);

    syncFromLocation();
  };

  const redirect = (path: string): void => {
    globalThis.window.history.replaceState(null, '', path);

    syncFromLocation();
  };

  const back = (): void => {
    globalThis.window.history.back();
  };

  const forward = (): void => {
    globalThis.window.history.forward();
  };

  const go = (delta?: number): void => {
    globalThis.window.history.go(delta);
  };

  const getPathSegments = (): readonly string[] =>
    state.getSnapshot().value.pathSegments;

  const applyToUrl = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    mutate: (target: URL) => void,
    options?: UpdateQueryParamsOptions,
  ): void => {
    const mut_url = new URL(globalThis.window.location.href);

    mutate(mut_url);

    const method = options?.method ?? 'pushState';

    if (method === 'replaceState') {
      globalThis.window.history.replaceState(null, '', mut_url.toString());
    } else {
      globalThis.window.history.pushState(null, '', mut_url.toString());
    }

    syncFromLocation();
  };

  const updateQueryParams = (
    recipe: (params: URLSearchParams) => void,
    options?: UpdateQueryParamsOptions,
  ): void => {
    applyToUrl((u) => {
      recipe(u.searchParams);
    }, options);
  };

  const getQueryParam = <T,>(
    serializer: QueryParamSerializer<T>,
  ): T | undefined => {
    const params = state.getSnapshot().value.searchParams;

    return serializer.decode(params.get(serializer.key));
  };

  const setQueryParam = <T,>(
    serializer: QueryParamSerializer<T>,
    value: T,
    options?: UpdateQueryParamsOptions,
  ): void => {
    const encoded = serializer.encode(value);

    applyToUrl((u) => {
      if (encoded !== undefined) {
        u.searchParams.set(serializer.key, encoded);
      } else {
        u.searchParams.delete(serializer.key);
      }
    }, options);
  };

  const deleteQueryParam = <T,>(
    serializer: QueryParamSerializer<T>,
    options?: UpdateQueryParamsOptions,
  ): void => {
    applyToUrl((u) => {
      u.searchParams.delete(serializer.key);
    }, options);
  };

  const dispose = (): void => {
    globalThis.window.removeEventListener('popstate', handlePopState);
  };

  return {
    routes,
    state,
    pathname,
    pathSegments,
    searchParams,
    push,
    redirect,
    back,
    forward,
    go,
    getPathSegments,
    updateQueryParams,
    getQueryParam,
    setQueryParam,
    deleteQueryParam,
    dispose,
  };
};
