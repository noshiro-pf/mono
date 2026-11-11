import { isNonNullObject } from 'ts-data-forge';
import type { PageMatch } from './href-with-search.mjs';
import { routeNodeKey, type RouteNodeInternals } from './internal/index.mjs';
import type { AnyRoutes, RouteBranch, RouteMatch } from './route-types.mjs';

/**
 * The nodes from the top of the tree down to the page `match` is, each with its
 * `meta` and the `Href` of its own page with the match's params: what a
 * breadcrumb or a title is built from. Empty when no page matched. The `Href`s
 * carry no search and no hash, and a `page: false` node has none.
 *
 * @example
 *
 * ```ts
 * const routes = defineRoutes({
 *   products: {
 *     meta: { label: 'Products' },
 *     children: {
 *       item: {
 *         params: { productId: param.int },
 *         meta: { label: 'Product' },
 *       },
 *     },
 *   },
 * });
 *
 * const branch = matchedBranch(
 *   routes,
 *   matchRoutes(routes, { pathname: '/products/42/' }),
 * );
 *
 * assert.deepStrictEqual(
 *   branch.map(({ meta }) => meta.label),
 *   ['Products', 'Product'],
 * );
 *
 * assert.deepStrictEqual<readonly (string | undefined)[]>(
 *   branch.map(({ href }) => href),
 *   ['/products/', '/products/42/'],
 * );
 * ```
 */
export const matchedBranch = <R extends AnyRoutes>(
  routes: R,
  match: RouteMatch<R>,
): RouteBranch<R> => {
  if (match.route === undefined) {
    return [];
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- `route` is not undefined, which a generic match does not narrow by
  const { params } = match as PageMatch<R>;

  const mut_entries: unknown[] = [];

  let mut_node: unknown = routes;

  for (const key of match.route.split('.')) {
    mut_node = isNonNullObject(mut_node)
      ? Reflect.get(mut_node, key)
      : undefined;

    const internals = internalsOf(mut_node);

    if (internals === undefined || !isNonNullObject(mut_node)) {
      throw new TypeError(
        `synstate-router: matchedBranch: ${match.route} is not a page of these routes`,
      );
    }

    mut_entries.push({
      id: Reflect.get(mut_node, 'id'),
      meta: Reflect.get(mut_node, 'meta'),
      href: internals.pageHref(params),
    });
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- each entry is read from the node its id names
  return mut_entries as RouteBranch<R>;
};

const internalsOf = (node: unknown): RouteNodeInternals | undefined => {
  if (!isNonNullObject(node)) {
    return undefined;
  }

  const internals: unknown = Reflect.get(node, routeNodeKey);

  return isNonNullObject(internals)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the key is the package's own symbol, which `defineRoutes` sets
      (internals as RouteNodeInternals)
    : undefined;
};
