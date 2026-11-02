import type { RelaxedExtract } from 'ts-type-forge';
import {
  hrefWithSearch,
  type PageMatch,
  type SearchPatch,
} from './href-with-search.mjs';
import type { Href } from './href.mjs';
import type {
  AnyRouteNode,
  AnyRoutes,
  RouteId,
  RouteMatch,
} from './route-types.mjs';

/** The match of the page `Id`. */
export type PageMatchOf<
  R extends AnyRoutes,
  Id extends string,
> = RelaxedExtract<RouteMatch<R>, Readonly<{ route: Id }>>;

/** The page ids at or below the node `N`. */
export type BranchIds<
  R extends AnyRoutes,
  N extends AnyRouteNode,
> = RelaxedExtract<RouteId<R>, N['id'] | `${N['id']}.${string}`>;

/**
 * What a binding's `Routes` gives a page: its params and search, and links to
 * the same page with its search changed.
 */
export type PageValues<
  M extends Readonly<{ params: unknown; search: unknown }>,
> = Readonly<{
  params: M['params'];
  search: M['search'];
  /** This page with the same params and `patch` laid over its search. */
  withSearch: (patch: SearchPatch<M['search']>) => Href;
}>;

/**
 * The {@link PageValues} of `match`, for a binding's `Routes`.
 *
 * @example
 *
 * ```ts
 * const routes = defineRoutes({
 *   home: { segment: '' },
 *   products: { search: { page: search.int({ default: 1 }) } },
 * });
 *
 * const m = matchRoutes(routes, { pathname: '/products/', search: 'page=3' });
 *
 * assert.isTrue(m.route === 'products');
 *
 * const values = pageValues(routes, m);
 *
 * assert.strictEqual(values.search.page, 3);
 *
 * assert.strictEqual(
 *   values.withSearch({ page: asSafeInt(4) }),
 *   '/products/?page=4',
 * );
 * ```
 */
export const pageValues = <R extends AnyRoutes, const M extends PageMatch<R>>(
  routes: R,
  match: M,
): PageValues<M> =>
  ({
    params: match.params,
    search: match.search,
    withSearch: (patch) => hrefWithSearch<R, M>(routes, match, patch),
  }) as const;
