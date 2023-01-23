import {
  pluckI,
  subject,
  withInitialValue,
  type InitializedObservable,
} from '@noshiro/syncflow';
import { Arr, IMap } from '@noshiro/ts-utils';

export type QueryParams = IMap<string, string>;

type PathnameAndQueryParams = Readonly<{
  pathname: string;
  queryParams: QueryParams;
}>;

export type Router = Readonly<{
  pathname$: InitializedObservable<string>;
  queryParams$: InitializedObservable<QueryParams>;
  push: (nextPath: string) => void;
  updateQueryParams: (
    recipe: (urlSearchParams: DeepReadonly<URLSearchParams>) => void,
    pushState: boolean,
    sortParams?: boolean
  ) => void;
  go: (delta?: number | undefined) => void;
  forward: () => void;
  back: () => void;
  redirect: (nextPath: string) => void;
  removeListener: () => void;
}>;

/**
 * @description Creates pathname Observable and queryParams Observable,
 * and starts listening URL changes.
 */
export const createRouter = (): Router => {
  const pathnameAndQueryParamsSource$ = subject<PathnameAndQueryParams>();

  const pathnameAndQueryParams$: InitializedObservable<PathnameAndQueryParams> =
    pathnameAndQueryParamsSource$.chain(
      withInitialValue({
        pathname: withSlash(window.location.pathname),
        queryParams: parseQueryParamsStr(window.location.search),
      })
    );

  const pathname$: InitializedObservable<PathnameAndQueryParams['pathname']> =
    pathnameAndQueryParams$.chain(pluckI('pathname'));

  const queryParams$: InitializedObservable<
    PathnameAndQueryParams['queryParams']
  > = pathnameAndQueryParams$.chain(pluckI('queryParams'));

  const updatePathname = (): void => {
    pathnameAndQueryParamsSource$.next({
      pathname: withSlash(window.location.pathname),
      queryParams: parseQueryParamsStr(window.location.search),
    });
  };

  const push = (nextPath: string): void => {
    const p = withSlash(nextPath);
    window.history.pushState({}, '', p);
    updatePathname();
  };

  const updateQueryParams = (
    recipe: (urlSearchParams: DeepReadonly<URLSearchParams>) => void,
    pushState: boolean = true,
    sortParams: boolean = true
  ): void => {
    const searchParams = new URLSearchParams(window.location.search);

    recipe(searchParams);

    if (sortParams) {
      searchParams.sort();
    }

    const p =
      searchParams.toString() === ''
        ? withSlash(window.location.pathname)
        : [withSlash(window.location.pathname), searchParams.toString()].join(
            '?'
          );

    if (pushState) {
      window.history.pushState({}, '', p);
    } else {
      window.history.replaceState({}, '', p);
    }
    updatePathname();
  };

  const go = (delta?: number | undefined): void => {
    window.history.go(delta);
    updatePathname();
  };

  const forward = (): void => {
    window.history.forward();
    updatePathname();
  };

  const back = (): void => {
    window.history.back();
    updatePathname();
  };

  const redirect = (nextPath: string): void => {
    const p = withSlash(nextPath);
    window.history.replaceState({}, '', p);
    updatePathname();
  };

  window.addEventListener('popstate', updatePathname);

  return {
    push,
    updateQueryParams,
    go,
    forward,
    back,
    redirect,
    pathname$,
    queryParams$,
    removeListener: () => {
      window.removeEventListener('popstate', updatePathname);
    },
  };
};

const validateKeyValuePairs = (
  kvs: DeepReadonly<string[][]>
): kvs is DeepReadonly<[string, string][]> => kvs.every(Arr.isArrayOfLength2);

const parseQueryParamsStr = (queryParamsStr: string): QueryParams => {
  if (!queryParamsStr.startsWith('?')) {
    return IMap.new<string, string>([]);
  }

  const keyValuePairs: DeepReadonly<string[][]> = queryParamsStr
    .slice(1) // remove "?"
    .split('&') // "key1=value1&key2=value2" -> ["key1=value1", "key2=value2"]
    .map((group) => group.split('=')); // "key1=value1" -> ["key1", "value1"]

  if (!validateKeyValuePairs(keyValuePairs)) {
    return IMap.new<string, string>([]);
  }

  return IMap.new<string, string>(keyValuePairs);
};

export const withSlash = (path: string): string =>
  path.endsWith('/')
    ? path
    : path.includes('/?')
    ? path
    : path.includes('?')
    ? path.split('?').join('/?')
    : `${path}/`;
