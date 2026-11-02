import { Optional } from 'ts-data-forge';
import { isAtOrBelow, pick, routeNodeKey } from './internal/index.mjs';
import type {
  AnyRouteNode,
  AnyRoutes,
  RouteMatch,
  RouteNodeValues,
} from './route-types.mjs';

/**
 * The node's params and search, when `match` is the node or one of its
 * descendants: what `router.at(node)` holds, for a match already in hand.
 *
 * @example
 *
 * ```ts
 * const routes = defineRoutes({
 *   users: { children: { item: { params: { userId: param.string } } } },
 * });
 *
 * const m = matchRoutes(routes, { pathname: '/users/alice/' });
 *
 * assert.deepStrictEqual(
 *   matchAt(routes.users, m),
 *   Optional.some({ params: {}, search: {} }),
 * );
 *
 * assert.deepStrictEqual(
 *   matchAt(routes.users.item, m),
 *   Optional.some({ params: { userId: 'alice' }, search: {} }),
 * );
 * ```
 */
export const matchAt = <N extends AnyRouteNode>(
  node: N,
  match: RouteMatch<AnyRoutes>,
): Optional<RouteNodeValues<N>> => {
  if (match.route === undefined || !isAtOrBelow(match.route, node.id)) {
    return Optional.none;
  }

  const { paramNames, searchKeys } = node[routeNodeKey];

  const values = {
    params: pick(match.params, paramNames),
    search: pick(match.search, searchKeys),
  } as const;

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- read with the codecs of `node`
  return Optional.some(values as RouteNodeValues<N>);
};
