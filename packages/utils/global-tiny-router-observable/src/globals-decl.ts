import type {
  createRouter as _createRouter,
  QueryParams as _QueryParams,
  Router as _Router,
  withSlash as _withSlash,
} from '@noshiro/tiny-router-observable';

declare global {
  type QueryParams = _QueryParams;
  type Router = _Router;

  /* custom types */

  const createRouter: typeof _createRouter;
  const withSlash: typeof _withSlash;

  /* custom variables */
}
