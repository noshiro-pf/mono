import {
  filter,
  map,
  withInitialValue,
  type InitializedObservable,
} from 'synstate';
import { createAfterUpdate, mountable, type JSX } from 'synstate-dom';
import {
  matchAt,
  pageValues,
  type AnyRouteNode,
  type AnyRoutes,
  type PageMatch,
  type PageValues,
  type RouteMatch,
  type RouteNodeValues,
  type Router,
} from 'synstate-router';
import { isNonNullObject, Optional } from 'ts-data-forge';
import type { RouterComponents } from '../create-router-components.mjs';
import { mountSwitch } from './mount-switch.mjs';

/** `Routes` bound to `router` (`RouterComponents['Routes']`). */
export const createRoutes = <R extends AnyRoutes>(
  router: Router<R>,
): RouterComponents<R>['Routes'] => {
  /** The values of `page`, following the match while the route stays `id`. */
  const pageValues$ = (
    id: string,
    page: PageMatch<R>,
  ): InitializedObservable<PageValues<PageMatch<R>>> =>
    router.match
      .pipe(filter((m): m is PageMatch<R> => m.route === id))
      .pipe(map((m) => pageValues(router.routes, m)))
      .pipe(withInitialValue(pageValues(router.routes, page)));

  /** The values of `node`, following the match while the page is below it. */
  const nodeValues$ = (
    node: AnyRouteNode,
    values: RouteNodeValues<AnyRouteNode>,
  ): InitializedObservable<RouteNodeValues<AnyRouteNode>> =>
    router
      .at(node)
      .pipe(filter(Optional.isSome))
      .pipe(map((some) => some.value))
      .pipe(withInitialValue(values));

  return ({ prefix, under, cases, notFound }) =>
    mountable(() => {
      /**
       * The key in `cases` of the case that draws `m`: the top-level node's
       * with `prefix`, the route id otherwise; `undefined` for `notFound`.
       * Runs on every match change, so it decodes nothing a branch does not
       * need to tell.
       */
      const keyOf = (m: RouteMatch<R>): string | undefined => {
        if (m.route === undefined) {
          return undefined;
        }

        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- `route` is not undefined, which a generic match does not narrow by
        const page = m as PageMatch<R>;

        if (prefix === true) {
          const key = page.route.split('.', 1)[0] ?? page.route;

          return isCase(Reflect.get(cases, key)) &&
            isRouteNode(Reflect.get(router.routes, key))
            ? key
            : undefined;
        }

        return isCase(Reflect.get(cases, page.route)) &&
          (under === undefined ||
            page.route === under.id ||
            page.route.startsWith(`${under.id}.`))
          ? page.route
          : undefined;
      };

      const nodes = mountSwitch(router.match, keyOf, (key, current) => {
        const draw: unknown =
          key === undefined ? undefined : Reflect.get(cases, key);

        if (key === undefined || current.route === undefined || !isCase(draw)) {
          return notFound;
        }

        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- `route` is not undefined, which a generic match does not narrow by
        const page = current as PageMatch<R>;

        if (prefix !== true) {
          return draw(pageValues$(key, page));
        }

        // The page is below its own top-level node, so this is some.
        const node: unknown = Reflect.get(router.routes, key);

        const values = isRouteNode(node) ? matchAt(node, page) : Optional.none;

        return isRouteNode(node) && Optional.isSome(values)
          ? draw(nodeValues$(node, values.value))
          : notFound;
      });

      // The new page is in the document once the update has finished: make the
      // navigation's scroll then, before the next paint. Each mounted `Routes`
      // asks, and the first to run makes the scroll; work queued by a `Routes`
      // the update unmounted is dropped.
      const afterUpdate = createAfterUpdate();

      router.match.subscribe(() => {
        afterUpdate(router.flushScroll);
      });

      return nodes;
    });
};

/** A case of `Routes`, which the types gave the values it is called with. */
const isCase = (value: unknown): value is (values$: unknown) => JSX.Element =>
  typeof value === 'function';

const isRouteNode = (value: unknown): value is AnyRouteNode =>
  isNonNullObject(value) && typeof Reflect.get(value, 'match') === 'function';
