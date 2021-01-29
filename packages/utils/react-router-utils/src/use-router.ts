import { History, Location } from 'history';
import { Context, useCallback, useContext, useMemo } from 'react';
import {
  match,
  RouteComponentProps,
  StaticContext,
  __RouterContext,
} from 'react-router';
import { pathnameToPathList } from './pathname-to-pathlist';

const useRouter = <RouteParam>(): RouteComponentProps<
  RouteParam,
  StaticContext,
  unknown
> =>
  useContext<RouteComponentProps<RouteParam, StaticContext, unknown>>(
    (__RouterContext as unknown) as Context<
      RouteComponentProps<RouteParam, StaticContext, unknown>
    >
  );

const useHistory = <RouteParam>(): History<unknown> => {
  const router = useRouter<RouteParam>();
  return useMemo(() => router.history, [router.history]);
};

const useLocation = <RouteParam>(): Location<unknown> => {
  const router = useRouter<RouteParam>();
  return useMemo(() => router.location, [router.location]);
};

export const useQuery = <RouteParam>(): URLSearchParams => {
  const location = useLocation<RouteParam>();
  const params = useMemo(() => new URLSearchParams(location.search), [
    location.search,
  ]);
  return params;
};

export const useMatch = <RouteParam>(): match<RouteParam> => {
  const router = useRouter<RouteParam>();
  return useMemo(() => router.match, [router.match]);
};

const usePathName = <RouteParam>(): string => {
  const location = useLocation<RouteParam>();
  return useMemo(() => location.pathname, [location.pathname]);
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
  const history = useHistory<RouteParam>();
  const navigator = useCallback(
    (pathname: string) => {
      if (pathname !== history.location.pathname) {
        history.push(pathname);
      }
    },
    [history]
  );
  return navigator;
};
