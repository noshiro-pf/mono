import {
  type back as _back,
  type pathname$ as _pathname$,
  type push as _push,
  type queryParams$ as _queryParams$,
  type redirect as _redirect,
  type removeListener as _removeListener,
  type usePathname as _usePathname,
  type useQueryParams as _useQueryParams,
  type useRouterLinkClick as _useRouterLinkClick,
} from '@noshiro/tiny-router-preact-hooks';

declare global {
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

  /* custom variables */
}
