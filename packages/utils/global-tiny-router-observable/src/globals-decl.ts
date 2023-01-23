import {
  type createRouter as _createRouter,
  type QueryParams as _QueryParams,
  type Router as _Router,
  type withSlash as _withSlash,
} from '@noshiro/tiny-router-observable';

declare global {
  type QueryParams = _QueryParams;
  type Router = _Router;

  /* custom types */

  const createRouter: typeof _createRouter;
  const withSlash: typeof _withSlash;

  /* custom variables */
}
