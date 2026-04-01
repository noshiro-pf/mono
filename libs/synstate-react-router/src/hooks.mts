import * as React from 'react';
import { type InitializedObservable } from 'synstate';
import {
  collectRouteNodes,
  routeMatch,
  type CollectRouteEntries,
  type QueryParamSerializer,
} from 'synstate-router';

type RouteMatchOptions = Readonly<{
  matchMode?: 'exact' | 'prefix';
}>;

const useObservableValue = <A,>(observable: InitializedObservable<A>): A =>
  React.useSyncExternalStore(
    (onStoreChange: () => void) => {
      const { unsubscribe } = observable.subscribe(onStoreChange);

      return unsubscribe;
    },
    () => observable.getSnapshot().value,
  );

export const usePathSegments = (
  pathSegments: InitializedObservable<readonly string[]>,
): readonly string[] => useObservableValue(pathSegments);

export const useQueryParam = <T,>(
  searchParams: InitializedObservable<URLSearchParams>,
  serializer: QueryParamSerializer<T>,
): T | undefined => {
  const params = useObservableValue(searchParams);

  return serializer.decode(params.get(serializer.key));
};

type RouteNodeLike = Readonly<{
  _params: Readonly<Record<string, string>>;
  pattern: string;
  match: (
    segments: readonly string[],
  ) => Readonly<Record<string, string>> | undefined;
  matchExact: (
    segments: readonly string[],
  ) => Readonly<Record<string, string>> | undefined;
}>;

type AnyCaseEntry<R> =
  | readonly [RouteNodeLike, (params: Readonly<Record<string, string>>) => R]
  | readonly [undefined, () => R];

/** Non-exhaustive route matching (tuple-based). */
export const useRouteMatch = <R,>(
  pathSegmentsObservable: InitializedObservable<readonly string[]>,
  cases: readonly AnyCaseEntry<R>[],
  options?: RouteMatchOptions,
): R => {
  const pathSegments = usePathSegments(pathSegmentsObservable);

  return React.useMemo(
    () => routeMatch(pathSegments, cases, options),
    [pathSegments, cases, options],
  );
};

type AnyHandlerMap<R> = Readonly<
  Record<
    string,
    ((params: Readonly<Record<string, string>>) => R) | undefined
  > & { fallback: () => R }
>;

/**
 * Exhaustive handler map type. Use with `satisfies` for compile-time
 * exhaustiveness checking and type-safe params:
 *
 * @example
 * ```tsx
 * type Handlers = ExhaustiveHandlers<typeof routes, React.JSX.Element>;
 *
 * const content = useMapRouteMatch(router.pathSegments, routes, {
 *   [routes.products.item.pattern]: ({ productId }) => ...,
 *   [routes.products.pattern]: () => ...,
 *   fallback: () => ...,
 * } satisfies Handlers);
 * ```
 */
type EntryPattern<E> =
  E extends Readonly<{ pattern: infer P extends string }> ? P : never;

type EntryParams<Entries, Pat extends string> =
  Entries extends Readonly<{ pattern: Pat; params: infer P }> ? P : never;

export type ExhaustiveHandlers<Routes, R> = Readonly<
  {
    [P in EntryPattern<CollectRouteEntries<Routes>>]:
      | ((params: EntryParams<CollectRouteEntries<Routes>, P>) => R)
      | undefined;
  } & { fallback: () => R }
>;

/** Partial handler map type (not all routes required). */
export type PartialHandlers<Routes, R> = Readonly<
  {
    [P in EntryPattern<CollectRouteEntries<Routes>>]?:
      | ((params: EntryParams<CollectRouteEntries<Routes>, P>) => R)
      | undefined;
  } & { fallback: () => R }
>;

/**
 * Map-based route matching. Use with `ExhaustiveHandlers` or `PartialHandlers`
 * via `satisfies` for type-safe params and optional exhaustiveness checking.
 */
export const useMapRouteMatch = <R,>(
  pathSegmentsObservable: InitializedObservable<readonly string[]>,
  routesDef: Readonly<Record<string, unknown>>,
  handlers: AnyHandlerMap<R>,
  options?: RouteMatchOptions,
): R => {
  const pathSegments = usePathSegments(pathSegmentsObservable);

  const allNodes = React.useMemo(
    () => collectRouteNodes(routesDef),
    [routesDef],
  );

  return React.useMemo(() => {
    const matchMode = options?.matchMode ?? 'exact';

    for (const node of allNodes) {
      const matchFn = matchMode === 'exact' ? node.matchExact : node.match;

      const params = matchFn(pathSegments);

      if (params !== undefined) {
        const handler = handlers[node.pattern];

        if (handler !== undefined) {
          return handler(params);
        }
      }
    }

    return handlers.fallback();
  }, [pathSegments, allNodes, handlers, options]);
};
