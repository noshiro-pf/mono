import { Arr, isNonNullObject } from 'ts-data-forge';
import type { RelaxedExclude } from 'ts-type-forge';
import type { Href } from './href.mjs';
import type { AnyRoutes, NotFoundMatch, RouteMatch } from './route-types.mjs';

/** A match of a page: a {@link RouteMatch} other than not found. */
export type PageMatch<R extends AnyRoutes> = RelaxedExclude<
  RouteMatch<R>,
  NotFoundMatch
>;

/** Part of a page's search, `undefined` meaning absent. */
export type SearchPatch<Search> = Readonly<{
  [K in keyof Search]?: Search[K] | undefined;
}>;

/**
 * The `Href` of the page `match` is, with the same params and `patch` laid over
 * its search: a link that changes a filter of the list on screen. The hash is
 * left out.
 *
 * @example
 *
 * ```ts
 * const routes = defineRoutes({
 *   home: { segment: '' },
 *   products: {
 *     search: { page: search.int({ default: 1 }), q: search.string() },
 *   },
 * });
 *
 * const m = matchRoutes(routes, {
 *   pathname: '/products/',
 *   search: 'q=shoe&page=3',
 * });
 *
 * assert.isTrue(m.route === 'products');
 *
 * // The assertion narrows the match to the page.
 * assert.strictEqual(
 *   hrefWithSearch(routes, m, { page: asSafeInt(1) }),
 *   '/products/?q=shoe',
 * );
 * ```
 */
export const hrefWithSearch = <
  R extends AnyRoutes,
  const M extends PageMatch<R>,
>(
  routes: R,
  match: M,
  patch: SearchPatch<M['search']>,
): Href => {
  const node = match.route
    .split('.')
    .reduce<unknown>(
      (parent, key) =>
        isNonNullObject(parent) ? Reflect.get(parent, key) : undefined,
      routes,
    );

  const href = isNonNullObject(node) ? Reflect.get(node, 'href') : undefined;

  if (!isFunction(href)) {
    throw new TypeError(
      `synstate-router: hrefWithSearch: ${match.route} is not a page of these routes`,
    );
  }

  const search = { ...match.search, ...patch } as const;

  // A page without params takes the options alone.
  const result: unknown = Arr.isEmpty(Object.keys(match.params))
    ? href({ search })
    : href(match.params, { search });

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a node's `href` returns an `Href`
  return result as Href;
};

const isFunction = (
  value: unknown,
): value is (...args: readonly unknown[]) => unknown =>
  typeof value === 'function';
