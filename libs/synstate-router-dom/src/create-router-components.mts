import type { JSX } from 'synstate-dom';
import type { AnyRouteNode, AnyRoutes, Router } from 'synstate-router';
import { createLink, createRoutes } from './internal/index.mjs';
import type { LinkProps } from './link-props.mjs';
import type { RoutesProps } from './routes-props.mjs';

export type RouterComponents<R extends AnyRoutes> = Readonly<{
  /**
   * Mounts the case of the page the location is. Every page id is a required
   * key, so a route added without a case fails `tsc`. The case is mounted again
   * only when the route id changes: new params of the same route flow through
   * the observable it was given.
   */
  Routes: <N extends AnyRouteNode = never>(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- `RoutesProps<R, N>` is a conditional type on `N`, which the rule cannot resolve; with `N` known it passes
    props: RoutesProps<R, N>,
  ) => JSX.Element;

  /**
   * An `<a>` that goes to an `Href` through the router, and leaves to the
   * browser what the browser should do (`handleLinkClick`).
   */
  Link: (props: LinkProps) => JSX.Element;
}>;

/**
 * Binds `Routes` and `Link` to `router`. synstate-dom has no context, so the
 * components are made for one router instead of being given it in every props;
 * export them from one module of the application.
 */
export const createRouterComponents = <R extends AnyRoutes>(
  router: Router<R>,
): RouterComponents<R> =>
  ({
    Routes: createRoutes(router),
    Link: createLink(router),
  }) as const;
