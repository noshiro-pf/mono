import * as React from 'react';
import { type InitializedObservable } from 'synstate';
import {
  collectRouteNodes,
  defineRoutes,
  fallback as fallbackCase,
  param,
  route as routeCase,
  routeMatch,
  type CollectRouteEntries,
  type QueryParamSerializer,
  type RouteParams,
} from 'synstate-router';
import { expectType } from 'ts-data-forge';

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

type AnyHandlerMap<R> = Record<
  string,
  ((params: Readonly<Record<string, string>>) => R) | undefined
> &
  Readonly<{ fallback: () => R }>;

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

// ---------------------------------------------------------------------------
// Type-level tests (stripped by rollup via expectType)
// ---------------------------------------------------------------------------

const noop = (..._args: readonly unknown[]): undefined => undefined;

const testRoutes = defineRoutes({
  home: { segment: '' },
  products: {
    children: {
      item: {
        params: { productId: param.path.string },
      },
    },
  },
  users: {
    children: {
      item: {
        params: { userId: param.path.string },
      },
    },
  },
  settings: {},
});

// --- route() tuple helper: params type inference ---

type ProductItemParams = RouteParams<typeof testRoutes.products.item>;

expectType<ProductItemParams, Readonly<{ productId: string }>>('=');

type UserItemParams = RouteParams<typeof testRoutes.users.item>;

expectType<UserItemParams, Readonly<{ userId: string }>>('=');

type SettingsParams = RouteParams<typeof testRoutes.settings>;

expectType<SettingsParams, Readonly<Record<never, string>>>('=');

// route() infers handler params from the node
const testRouteCase = routeCase(testRoutes.products.item, (p) => {
  expectType<typeof p, Readonly<{ productId: string }>>('=');

  return p.productId;
});

expectType<
  typeof testRouteCase,
  readonly [
    typeof testRoutes.products.item,
    (params: Readonly<{ productId: string }>) => string,
  ]
>('=');

noop(testRouteCase);

// --- ExhaustiveHandlers: all patterns required, params typed ---

type TestExhaustive = ExhaustiveHandlers<typeof testRoutes, string>;

// Required keys: every route pattern must appear
expectType<
  keyof TestExhaustive,
  | '/'
  | '/products'
  | '/products/:productId'
  | '/users'
  | '/users/:userId'
  | '/settings'
  | 'fallback'
>('=');

// Each handler receives correct params
type ProductItemHandler = TestExhaustive['/products/:productId'];

expectType<
  ProductItemHandler,
  ((params: Readonly<{ productId: string }>) => string) | undefined
>('=');

type UserItemHandler = TestExhaustive['/users/:userId'];

expectType<
  UserItemHandler,
  ((params: Readonly<{ userId: string }>) => string) | undefined
>('=');

type SettingsHandler = TestExhaustive['/settings'];

expectType<
  SettingsHandler,
  ((params: Readonly<Record<never, string>>) => string) | undefined
>('=');

// --- PartialHandlers: all keys optional (except fallback) ---

type TestPartial = PartialHandlers<typeof testRoutes, string>;

// fallback is required
expectType<TestPartial['fallback'], () => string>('=');

// route handlers are optional
type PartialProductHandler = TestPartial['/products/:productId'];

expectType<
  PartialProductHandler,
  ((params: Readonly<{ productId: string }>) => string) | undefined
>('=');

// --- routeMatch tuple: return type inference ---

const testTupleResult = routeMatch(
  ['products', '42'],
  [
    routeCase(testRoutes.products.item, ({ productId }) => productId),
    routeCase(testRoutes.products, () => 'list'),
    fallbackCase(() => 'not-found'),
  ],
);

expectType<typeof testTupleResult, string>('=');

noop(testTupleResult);
