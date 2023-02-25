import {
  type back as VAR_back,
  type pathname$ as VAR_pathname$,
  type push as VAR_push,
  type queryParams$ as VAR_queryParams$,
  type redirect as VAR_redirect,
  type removeListener as VAR_removeListener,
  type usePathname as VAR_usePathname,
  type useQueryParams as VAR_useQueryParams,
  type useRouterLinkClick as VAR_useRouterLinkClick,
} from '@noshiro/tiny-router-react-hooks';

declare global {
  /* custom types */

  const back: typeof VAR_back;
  const pathname$: typeof VAR_pathname$;
  const push: typeof VAR_push;
  const queryParams$: typeof VAR_queryParams$;
  const redirect: typeof VAR_redirect;
  const removeListener: typeof VAR_removeListener;
  const usePathname: typeof VAR_usePathname;
  const useQueryParams: typeof VAR_useQueryParams;
  const useRouterLinkClick: typeof VAR_useRouterLinkClick;

  /* custom variables */
}
