import type { ReadonlyRecord } from 'ts-type-forge';
import type { RouteDefinitions, RouteLocation } from '../route-types.mjs';

/** Where the compiled tree is kept on the object `defineRoutes` returns. */
export const routeTreeKey: unique symbol = Symbol('synstate-router/route-tree');

/** The compiled tree, typed by the definition it came from. */
export type RouteTree<D extends RouteDefinitions> = Readonly<{
  definition: D;
  /** Resolves a location against the whole tree. */
  resolve: (location: RouteLocation) => ResolvedLocation;
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
    }
>;
