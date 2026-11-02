import type * as React from 'react';
import type {
  AnyRouteNode,
  AnyRoutes,
  Href,
  RouteId,
  RouteMatch,
  RouteNodeValues,
  SearchPatch,
} from 'synstate-router';
import type { RelaxedExtract } from 'ts-type-forge';

/** What a page's case receives: its values, and links that change its search. */
export type CaseValues<
  M extends Readonly<{ params: unknown; search: unknown }>,
> = Readonly<{
  params: M['params'];
  search: M['search'];
  /** This page with the same params and `patch` laid over its search. */
  withSearch: (patch: SearchPatch<M['search']>) => Href;
}>;

/** The match of the page `Id`. */
export type PageMatchOf<
  R extends AnyRoutes,
  Id extends string,
> = RelaxedExtract<RouteMatch<R>, Readonly<{ route: Id }>>;

/**
 * A case for each page id in `Ids`, all required: `undefined` for a page that
 * is not drawn yet, which falls to `notFound`.
 */
export type PageCases<R extends AnyRoutes, Ids extends string> = Readonly<{
  [Id in Ids]:
    ((values: CaseValues<PageMatchOf<R, Id>>) => React.ReactNode) | undefined;
}>;

/** The page ids at or below `N`. */
export type BranchIds<
  R extends AnyRoutes,
  N extends AnyRouteNode,
> = RelaxedExtract<RouteId<R>, N['id'] | `${N['id']}.${string}`>;

/** A case for each top-level node, for layouts: the node's prefix match. */
export type PrefixCases<R extends AnyRoutes> = Readonly<{
  [K in keyof R & string]:
    | (R[K] extends AnyRouteNode
        ? (values: RouteNodeValues<R[K]>) => React.ReactNode
        : never)
    | undefined;
}>;

export type RoutesProps<
  R extends AnyRoutes,
  N extends AnyRouteNode,
> = Readonly<{
  /** Drawn when no case draws the location. Defaults to nothing. */
  notFound?: React.ReactNode;
}> &
  (
    | Readonly<{
        /** Branch on the top-level node the page is under, for a layout. */
        prefix: true;
        under?: undefined;
        cases: PrefixCases<R>;
      }>
    | ([N] extends [never]
        ? Readonly<{
            prefix?: false;
            under?: undefined;
            cases: PageCases<R, RouteId<R>>;
          }>
        : Readonly<{
            prefix?: false;
            /** Branch on the pages at or below this node only. */
            under: N;
            cases: PageCases<R, BranchIds<R, N>>;
          }>)
  );
