import type { History as HistoryType, Location as LocationType } from 'history';
import type { Context } from 'react';
import { useCallback, useContext, useMemo } from 'react';
import type { match, RouteComponentProps, StaticContext } from 'react-router';
import { __RouterContext } from 'react-router';
import { pathnameToPathList } from './pathname-to-pathlist';

const useRouter = <RouteParam>(): RouteComponentProps<
  RouteParam,
  StaticContext,
  unknown
> =>
  useContext<RouteComponentProps<RouteParam, StaticContext, unknown>>(
    __RouterContext as unknown as Context<
      RouteComponentProps<RouteParam, StaticContext, unknown>
    >
  );

const useHistory = <RouteParam>(): HistoryType<unknown> => {
  const router = useRouter<RouteParam>();
  return useMemo(() => router.history, [router.history]);
};

const useLocation = <RouteParam>(): LocationType<unknown> => {
  const router = useRouter<RouteParam>();
  return useMemo(() => router.location, [router.location]);
};

export const useQuery = <RouteParam>(): URLSearchParams => {
  const loc = useLocation<RouteParam>();
  const params = useMemo(() => new URLSearchParams(loc.search), [loc.search]);
  return params;
};

export const useMatch = <RouteParam>(): match<RouteParam> => {
  const router = useRouter<RouteParam>();
  return useMemo(() => router.match, [router.match]);
};

const usePathName = <RouteParam>(): string => {
  const loc = useLocation<RouteParam>();
  return useMemo(() => loc.pathname, [loc.pathname]);
};

export const usePathNameList = <RouteParam>(): string[] => {
  const pathname = usePathName<RouteParam>();
  return useMemo(() => pathnameToPathList(pathname), [pathname]);
};

/**
 * `pathname !== history.location.pathname` is added to avoid a following warning:
 * "Hash history cannot PUSH the same path; a new entry will not be added to the history stack"
 */
export const useNavigator = <RouteParam>(): ((pathname: string) => void) => {
  const hist = useHistory<RouteParam>();
  const nav = useCallback(
    (pathname: string) => {
      if (pathname !== hist.location.pathname) {
        hist.push(pathname);
      }
    },
    [hist]
  );
  return nav;
};
