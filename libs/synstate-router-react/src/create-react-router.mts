import type * as React from 'react';
import type {
  AnyRouteNode,
  AnyRoutes,
  RouteBranch,
  RouteMatch,
  RouteNodeValues,
  Router,
} from 'synstate-router';
import type { Optional } from 'ts-data-forge';
import {
  createLink,
  createRoutes,
  useObservableValue,
} from './internal/index.mjs';
import type { LinkProps } from './link-props.mjs';
import type { RoutesProps } from './routes-props.mjs';

export type ReactRouter<R extends AnyRoutes> = Readonly<{
  /**
   * Draws the case of the page the location is. Every page id is a required
   * key, so a route added without a case fails `tsc`. The element is keyed by
   * the route id (with `prefix`, by the top-level node): a new route remounts
   * it, new params of the same route update it. A case is drawn as a component
   * of its own, so the hooks it calls are its own and are remounted on a new
   * route.
   */
  Routes: <N extends AnyRouteNode = never>(
    props: RoutesProps<R, N>,
  ) => React.JSX.Element;

  /**
   * An `<a>` that goes to an `Href` through the router, and leaves to the
   * browser what the browser should do (`handleLinkClick`).
   */
  Link: (props: LinkProps) => React.JSX.Element;

  /** The match; a `switch` on `route` narrows it. */
  useRouteMatch: () => RouteMatch<R>;

  /**
   * `router.branch`'s value: the nodes from the top down to the page, with
   * their `meta` and `Href`s, for a breadcrumb or a title.
   */
  useBranch: () => RouteBranch<R>;

  /** `router.at(node)`'s value. */
  useAt: <N extends AnyRouteNode>(node: N) => Optional<RouteNodeValues<N>>;

  /** `router.isActive(node, options)`'s value. */
  useIsActive: (
    node: AnyRouteNode,
    options?: Readonly<{ exact?: boolean }>,
  ) => boolean;
}>;

/**
 * Binds the React components and hooks to `router`. No context and no global
 * registration: the types come from the router, so a test makes its own from a
 * router on a memory browser.
 */
export const createReactRouter = <R extends AnyRoutes>(
  router: Router<R>,
): ReactRouter<R> =>
  ({
    Routes: createRoutes(router),
    Link: createLink(router),
    useRouteMatch: () => useObservableValue(router.match),
    useBranch: () => useObservableValue(router.branch),
    useAt: (node) => useObservableValue(router.at(node)),
    useIsActive: (node, options) =>
      useObservableValue(router.isActive(node, options)),
  }) as const;
