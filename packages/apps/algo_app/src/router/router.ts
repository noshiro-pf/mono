import { IMap, isArrayOfLength2 } from '@noshiro/ts-utils';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { withSlash } from '../constants';

type Router = DeepReadonly<{
  pathname: string;
  queryParams: QueryParams;
  push: (nextPath: string) => void;
  replace: (nextPath: string) => void;
  back: () => void;
}>;

export type QueryParams = IMap<string, string>;

export const useRouter = (): Router => {
  const [{ pathname, queryParams }, setLocation] = useState<
    Readonly<{
      pathname: string;
      queryParams: QueryParams;
    }>
  >({
    pathname: location.pathname,
    queryParams: parseQueryParamsStr(location.search),
  });

  const updatePathname = useCallback(() => {
    setLocation({
      pathname: location.pathname,
      queryParams: parseQueryParamsStr(location.search),
    });
  }, []);

  const push = useCallback(
    (nextPath: string) => {
      const p = withSlash(nextPath);
      history.pushState({}, '', p);
      updatePathname();
    },
    [updatePathname]
  );

  const back = useCallback(() => {
    window.history.back();
    updatePathname();
  }, [updatePathname]);

  const replace = useCallback(
    (nextPath: string) => {
      const p = withSlash(nextPath);
      window.history.replaceState({}, '', p);
      updatePathname();
    },
    [updatePathname]
  );

  useEffect(() => {
    window.addEventListener('popstate', updatePathname);
    return () => {
      window.removeEventListener('popstate', updatePathname);
    };
  }, [updatePathname]);

  return {
    pathname: withSlash(pathname),
    queryParams,
    push,
    replace,
    back,
  };
};

const validateKeyValuePairs = (
  kvs: DeepReadonly<string[][]>
): kvs is DeepReadonly<[string, string][]> => kvs.every(isArrayOfLength2);

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
