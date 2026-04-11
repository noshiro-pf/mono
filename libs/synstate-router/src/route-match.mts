import { hasKey, isNonNullObject, isRecord } from 'ts-data-forge';
import {
  type ExhaustiveRouteHandlerMap,
  type PartialRouteHandlerMap,
  type RouteParams,
  type RoutesDefInput,
} from './route-types.mjs';

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

type RouteMatchOptions = Readonly<{
  matchMode?: 'exact' | 'prefix';
}>;

// --- Tuple-based API (non-exhaustive) ---

type RouteCase<N extends RouteNodeLike, R> = readonly [
  node: N,
  handler: (params: RouteParams<N>) => R,
];

export const route = <N extends RouteNodeLike, R>(
  node: N,
  handler: (params: RouteParams<N>) => R,
): RouteCase<N, R> => [node, handler] as const;

export const fallback = <R,>(handler: () => R): readonly [undefined, () => R] =>
  [undefined, handler] as const;

type AnyCaseEntry<R> =
  | RouteCase<RouteNodeLike, R>
  | readonly [undefined, () => R];

/**
 * Non-exhaustive route matching with type-safe params via tuples.
 */
export const routeMatch = <R,>(
  pathSegments: readonly string[],
  cases: readonly AnyCaseEntry<R>[],
  options?: RouteMatchOptions,
): R => {
  const matchMode = options?.matchMode ?? 'exact';

  for (const entry of cases) {
    const [node, handler] = entry;

    if (node === undefined) {
      return (handler as () => R)();
    }

    const matchFn = matchMode === 'exact' ? node.matchExact : node.match;

    const params = matchFn(pathSegments);

    if (params !== undefined) {
      return handler(params);
    }
  }

  throw new Error('routeMatch: no matching route and no fallback provided');
};

// --- Map-based API (exhaustive / partial) ---

type AnyHandlerMap<R> = Record<
  string,
  ((params: Readonly<Record<string, string>>) => R) | undefined
> &
  Readonly<{ fallback: () => R }>;

const matchWithHandlerMap = <R,>(
  pathSegments: readonly string[],
  routeNodes: readonly RouteNodeLike[],
  handlers: AnyHandlerMap<R>,
  options?: RouteMatchOptions,
): R => {
  const matchMode = options?.matchMode ?? 'exact';

  for (const node of routeNodes) {
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
};

/**
 * Exhaustive route matching: every route pattern defined in the routes tree
 * must have a handler. Use `undefined` to skip a route (falls to fallback).
 */
export const exhaustiveRouteMatch = <const D extends RoutesDefInput, R>(
  pathSegments: readonly string[],
  routeNodes: readonly RouteNodeLike[],
  handlers: ExhaustiveRouteHandlerMap<D, R>,
  options?: RouteMatchOptions,
): R =>
  matchWithHandlerMap(
    pathSegments,
    routeNodes,
    handlers as AnyHandlerMap<R>,
    options,
  );

/**
 * Partial (non-exhaustive) route matching with a handler map.
 * Only the routes you provide handlers for are matched.
 */
export const partialRouteMatch = <const D extends RoutesDefInput, R>(
  pathSegments: readonly string[],
  routeNodes: readonly RouteNodeLike[],
  handlers: PartialRouteHandlerMap<D, R>,
  options?: RouteMatchOptions,
): R =>
  matchWithHandlerMap(
    pathSegments,
    routeNodes,
    handlers as AnyHandlerMap<R>,
    options,
  );

// --- Utilities ---

const isRouteNode = (value: unknown): value is RouteNodeLike =>
  isNonNullObject(value) &&
  isRecord(value) &&
  hasKey(value, 'pattern') &&
  typeof value.pattern === 'string';

export const collectRouteNodes = (
  routesObj: Readonly<Record<string, unknown>>,
): readonly RouteNodeLike[] => {
  const mut_nodes: RouteNodeLike[] = [];

  const collect = (obj: Readonly<Record<string, unknown>>): void => {
    for (const value of Object.values(obj)) {
      if (isRouteNode(value)) {
        mut_nodes.push(value);

        collect(value);
      }
    }
  };

  collect(routesObj);

  return mut_nodes.toSorted(
    (a, b) => b.pattern.split('/').length - a.pattern.split('/').length,
  );
};
