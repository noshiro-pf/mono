import {
  type Router as TYPE_Router,
  type createRouter as VAR_createRouter,
  type withSlash as VAR_withSlash,
} from '@noshiro/tiny-router-observable';

declare global {
  type Router = TYPE_Router;

  /* custom types */

  const createRouter: typeof VAR_createRouter;
  const withSlash: typeof VAR_withSlash;

  /* custom variables */
}
