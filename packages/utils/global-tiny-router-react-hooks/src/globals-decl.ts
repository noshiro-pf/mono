import type {
  back as _back,
  pathname$ as _pathname$,
  push as _push,
  QueryParams as _QueryParams,
  queryParams$ as _queryParams$,
  redirect as _redirect,
  removeListener as _removeListener,
  Router as _Router,
  usePathname as _usePathname,
  useQueryParams as _useQueryParams,
  useRouterLinkClick as _useRouterLinkClick,
  withSlash as _withSlash,
} from '@noshiro/tiny-router-react-hooks';

declare global {
  type QueryParams = _QueryParams;
  type Router = _Router;

  const back: typeof _back;
  const pathname$: typeof _pathname$;
  const push: typeof _push;
  const queryParams$: typeof _queryParams$;
  const redirect: typeof _redirect;
  const removeListener: typeof _removeListener;
  const usePathname: typeof _usePathname;
  const useQueryParams: typeof _useQueryParams;
  const useRouterLinkClick: typeof _useRouterLinkClick;
  const withSlash: typeof _withSlash;
}
