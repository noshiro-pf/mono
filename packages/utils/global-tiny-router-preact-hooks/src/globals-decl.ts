import {
  type back as _back,
  type pathname$ as _pathname$,
  type push as _push,
  type QueryParams as _QueryParams,
  type queryParams$ as _queryParams$,
  type redirect as _redirect,
  type removeListener as _removeListener,
  type Router as _Router,
  type usePathname as _usePathname,
  type useQueryParams as _useQueryParams,
  type useRouterLinkClick as _useRouterLinkClick,
  type withSlash as _withSlash,
} from '@noshiro/tiny-router-preact-hooks';

declare global {
  type QueryParams = _QueryParams;
  type Router = _Router;

  /* custom types */

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

  /* custom variables */
}
