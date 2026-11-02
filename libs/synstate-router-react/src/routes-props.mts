import type * as React from 'react';
import type {
  AnyRouteNode,
  AnyRoutes,
  BranchIds,
  PageMatchOf,
  PageValues,
  RouteId,
  RouteNodeValues,
} from 'synstate-router';

/**
 * A case for each page id in `Ids`, all required: `undefined` for a page that
 * is not drawn yet, which falls to `notFound`.
 */
export type PageCases<R extends AnyRoutes, Ids extends string> = Readonly<{
  [Id in Ids]:
    ((values: PageValues<PageMatchOf<R, Id>>) => React.ReactNode) | undefined;
}>;

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
