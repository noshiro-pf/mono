/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-member-access,
  functional/immutable-data
*/

import {
  back,
  pathname$,
  push,
  queryParams$,
  redirect,
  removeListener,
  usePathname,
  useQueryParams,
  useRouterLinkClick,
} from '@noshiro/tiny-router-preact-hooks';

(global as any).back = back;
(global as any).pathname$ = pathname$;
(global as any).push = push;
(global as any).queryParams$ = queryParams$;
(global as any).redirect = redirect;
(global as any).removeListener = removeListener;
(global as any).usePathname = usePathname;
(global as any).useQueryParams = useQueryParams;
(global as any).useRouterLinkClick = useRouterLinkClick;
