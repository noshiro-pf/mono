import {
  type ReadonlyURLSearchParams as TYPE_ReadonlyURLSearchParams,
  type Router as TYPE_Router,
  type RouterState as TYPE_RouterState,
  type UpdateQueryParamsOptions as TYPE_UpdateQueryParamsOptions,
  type createRouter as VAR_createRouter,
} from '@noshiro/tiny-router-observable';

declare global {
  type Router = TYPE_Router;
  type ReadonlyURLSearchParams = TYPE_ReadonlyURLSearchParams;
  type RouterState = TYPE_RouterState;
  type UpdateQueryParamsOptions = TYPE_UpdateQueryParamsOptions;

  /* custom types */

  const createRouter: typeof VAR_createRouter;

  /* custom variables */
}
