import {
  type createRouter as VAR_createRouter,
  type QueryParams as TYPE_QueryParams,
  type Router as TYPE_Router,
  type withSlash as VAR_withSlash,
} from '@noshiro/tiny-router-observable';

declare global {
  type QueryParams = TYPE_QueryParams;
  type Router = TYPE_Router;

  /* custom types */

  const createRouter: typeof VAR_createRouter;
  const withSlash: typeof VAR_withSlash;

  /* custom variables */
}
