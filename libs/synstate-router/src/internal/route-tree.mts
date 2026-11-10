import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import type { Href } from '../href.mjs';
import type {
  AnyHistoryStateCodec,
  RouteDefinitions,
  RouteLocation,
} from '../route-types.mjs';

/** Where the compiled tree is kept on the object `defineRoutes` returns. */
export const routeTreeKey: unique symbol = Symbol('synstate-router/route-tree');

/**
 * The compiled tree, typed by the definition it came from.
 *
 * @internal Kept under a symbol key of `Routes` for the router, written by
 * `defineRoutes`: no entry point exports the key.
 */
export type RouteTree<D extends RouteDefinitions> = Readonly<{
  definition: D;
  /** Resolves a location against the whole tree. */
  resolve: (location: RouteLocation) => ResolvedLocation;
  /** The history state codec the page declares, if any. */
  stateCodecOf: (page: string) => AnyHistoryStateCodec | undefined;
}>;

/** What the whole tree resolves a location to. */
export type ResolvedLocation = Readonly<
  | {
      page: undefined;
      pathname: string;
    }
  | {
      page: string;
      pathname: string;
      params: ReadonlyRecord<string, unknown>;
      search: ReadonlyRecord<string, unknown>;
      /** Present when the page declares a state, `undefined` for none. */
      state?: unknown;
    }
>;

/** Where a node keeps what the router needs of it. */
export const routeNodeKey: unique symbol = Symbol('synstate-router/route-node');

/**
 * What the router reads of a node.
 *
 * @internal Kept under a symbol key of each node for the router, written by
 * `defineRoutes`: a consumer passes the nodes `defineRoutes` returns, and no
 * entry point exports the key.
 */
export type RouteNodeInternals = Readonly<{
  /** The compiled tree the node belongs to, compared by identity. */
  tree: RouteTree<RouteDefinitions>;
  /**
   * The `Href` of the node's own page with `params` (its own and its
   * ancestors'), or `undefined` for a `page: false` node and for one whose URL
   * with these params resolves to another page.
   */
  pageHref: (params: ReadonlyRecord<string, unknown>) => Href | undefined;
  /** The path parameters of the node, its ancestors' included. */
  paramNames: readonly string[];
  /** The search keys of the node, its ancestors' included. */
  searchKeys: readonly string[];
  /**
   * The query entries of `values`, in declaration order; throws as `href` does
   * on a value that does not read back. `where` names the caller.
   */
  encodeSearch: (
    where: string,
    values: ReadonlyRecord<string, unknown>,
  ) => readonly FixedLengthTuple<2, string>[];
}>;
