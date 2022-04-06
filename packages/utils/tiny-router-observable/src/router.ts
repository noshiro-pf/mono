import type { InitializedObservable } from '@noshiro/syncflow';
import { pluckI, subject, withInitialValue } from '@noshiro/syncflow';
import { IList, IMap } from '@noshiro/ts-utils';

export type QueryParams = IMap<string, string>;

type PathnameAndQueryParams = Readonly<{
  pathname: string;
  queryParams: QueryParams;
}>;

export type Router = Readonly<{
  pathname$: InitializedObservable<string>;
  queryParams$: InitializedObservable<QueryParams>;
  push: (nextPath: string) => void;
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
): kvs is DeepReadonly<[string, string][]> => kvs.every(IList.isArrayOfLength2);

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
  path.endsWith('/') ? path : `${path}/`;
