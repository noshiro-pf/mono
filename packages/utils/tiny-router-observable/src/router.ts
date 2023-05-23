import {
  createState,
  mapI,
  pluckI,
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

export type Router = Readonly<{
  pathname$: InitializedObservable<string>;

  pathSegments$: InitializedObservable<readonly string[]>;
  queryParams$: InitializedObservable<DeepReadonly<URLSearchParams>>;

  push: (nextUrl: string) => void;

  updateQueryParams: (
    recipe: (
      urlSearchParams: DeepReadonly<URLSearchParams>
    ) => DeepReadonly<URLSearchParams>,
    options?: UpdateQueryParamsOptions
  ) => void;

  go: (delta?: number | undefined) => void;

  forward: () => void;

  back: () => void;

  redirect: (nextUrl: string) => void;

  removeListener: () => void;
}>;

/**
 * @description Creates pathname Observable and queryParams Observable,
 * and starts listening URL changes.
 */
export const createRouter = (): Router => {
  const { state$: url$, setState: setUrl } = createState<URL>(
    new URL(window.location.href)
  );

  const pathname$: InitializedObservable<string> = url$.chain(
    pluckI('pathname')
  );

  const queryParams$: InitializedObservable<URLSearchParams> = url$.chain(
    pluckI('searchParams')
  );

  const updateState = (): void => {
    setUrl(new URL(window.location.href));
  };

  const push = (nextPath: string): void => {
    const p = withSlash(nextPath);
    window.history.pushState({}, '', p);
    updateState();
  };

  const updateQueryParams = (
    recipe: (
      urlSearchParams: DeepReadonly<URLSearchParams>
    ) => DeepReadonly<URLSearchParams>,
    options?: UpdateQueryParamsOptions
  ): void => {
    const mut_url = castWritable(new URL(window.location.href));

    const { sortParams = true, method = 'pushState' } = options ?? {};

    const nextSearchParams = pipe(mut_url.searchParams)
      .chain(recipe)
      .chain(
        sortParams
          ? (a) => {
              a.sort();
              return a;
            }
          : (a) => a
      )
      .chain((a) => a.toString()).value;

    if (nextSearchParams === mut_url.searchParams.toString()) return;

    mut_url.search = nextSearchParams;

    switch (method) {
      case 'pushState':
        window.history.pushState({}, '', mut_url.toString());
        break;
      case 'replaceState':
        window.history.replaceState({}, '', mut_url.toString());
        break;
    }
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

  const redirect = (nextUrl: string): void => {
    const p = withSlash(nextUrl);
    window.history.replaceState({}, '', p);
    updateState();
  };

  window.addEventListener('popstate', updateState);

  const pathSegments$: InitializedObservable<readonly string[]> =
    pathname$.chain(
      mapI((pathname) => pathname.split('/').filter((s) => s !== ''))
    );

  return {
    push,
    updateQueryParams,
    go,
    forward,
    back,
    redirect,
    pathname$,
    queryParams$,
    pathSegments$,
    removeListener: () => {
      window.removeEventListener('popstate', updateState);
    },
  };
};

export const withSlash = (path: string): string =>
  path.endsWith('/')
    ? path
    : path.includes('/?')
    ? path
    : path.includes('?')
    ? path.split('?').join('/?')
    : `${path}/`;
