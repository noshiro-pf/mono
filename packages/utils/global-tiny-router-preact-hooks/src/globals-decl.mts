import {
  type createRouterLinkClickHandler as VAR_createRouterLinkClickHandler,
  type useRouterLinkClick as VAR_useRouterLinkClick,
} from '@noshiro/tiny-router-preact-hooks';

declare global {
  /* custom types */

  const useRouterLinkClick: typeof VAR_useRouterLinkClick;
  const createRouterLinkClickHandler: typeof VAR_createRouterLinkClickHandler;

  /* custom variables */
}
