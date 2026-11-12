import type { InitializedObservable } from 'synstate';
import type { JSX } from 'synstate-dom';
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
 * is not drawn yet, which falls to `notFound`. A case is called once each time
 * its page is entered, with an observable of the page's values, which follows
 * new params and search for as long as the page stays.
 */
export type PageCases<R extends AnyRoutes, Ids extends string> = Readonly<{
  [Id in Ids]:
    | ((
        values$: InitializedObservable<PageValues<PageMatchOf<R, Id>>>,
      ) => JSX.Element)
    | undefined;
}>;

/**
 * A case for each top-level node, for layouts: called once each time the page
 * moves under the node, with an observable of the node's values.
 */
export type PrefixCases<R extends AnyRoutes> = Readonly<{
  [K in keyof R & string]:
    | (R[K] extends AnyRouteNode
        ? (values$: InitializedObservable<RouteNodeValues<R[K]>>) => JSX.Element
        : never)
    | undefined;
}>;

export type RoutesProps<
  R extends AnyRoutes,
  N extends AnyRouteNode,
> = Readonly<{
  /** Mounted when no case draws the location. Defaults to nothing. */
  notFound?: JSX.Element;
  /**
   * Mounted until the router is `ready`: while an asynchronous `redirect` for
   * the URL the document was loaded at is awaited, no page is mounted. Defaults
   * to nothing.
   */
  pending?: JSX.Element;
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
