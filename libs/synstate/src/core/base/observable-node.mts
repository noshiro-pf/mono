import type {
  AsyncChildObservable,
  NonEmptyUnknownList,
  Observable,
  ObservableBase,
  RootObservable,
  SyncChildObservable,
  UpdateToken,
} from '../types/index.mjs';

/**
 * The members propagation reads on every observable, which the public types
 * leave out (#2117). One observable calls them on another — a child calls its
 * parent's `addChild`, a parent its children's `tryComplete` — so they cannot be closures
 * private to one object; what TypeScript's `protected` cannot express is
 * expressed by keeping these types in `core/base`, which index generation
 * excludes from the package.
 */
type NodeInternals = Readonly<{
  // reactive dependency tree structure
  addChild: <B>(child: ChildObservableNode<B>) => void;
  deleteChild: <B>(child: ChildObservableNode<B>) => void;

  // state
  hasSubscriber: boolean;
  hasChild: boolean;
  hasActiveChild: () => boolean;

  tryUpdate: (updateToken: UpdateToken) => void;
  tryComplete: () => void;
}>;

type ManagerInternals = Readonly<{
  addDescendant: <B>(child: ChildObservableNode<B>) => void;
  deleteDescendant: <B>(child: ChildObservableNode<B>) => void;
}>;

/** What every node has, whatever its kind. */
export type ObservableBaseNode<A> = NodeInternals & ObservableBase<A>;

export type SyncChildObservableNode<
  A,
  P extends NonEmptyUnknownList = NonEmptyUnknownList,
> = NodeInternals & SyncChildObservable<A, P>;

export type AsyncChildObservableNode<
  A,
  P extends NonEmptyUnknownList = NonEmptyUnknownList,
> = AsyncChildObservable<A, P> & ManagerInternals & NodeInternals;

export type RootObservableNode<A> = ManagerInternals &
  NodeInternals &
  RootObservable<A>;

export type ChildObservableNode<
  A,
  P extends NonEmptyUnknownList = NonEmptyUnknownList,
> = AsyncChildObservableNode<A, P> | SyncChildObservableNode<A, P>;

export type ManagerObservableNode<A> =
  AsyncChildObservableNode<A> | RootObservableNode<A>;

export type ObservableNode<A> =
  | AsyncChildObservableNode<A>
  | RootObservableNode<A>
  | SyncChildObservableNode<A>;

/**
 * The one place a public observable is seen as the node it is. Every
 * observable is built by a synstate factory, which always assembles the
 * internal members, and the public types carry a brand an object literal
 * cannot supply, so this holds for every value of those types.
 */
export const toNode = <A,>(observable: Observable<A>): ObservableNode<A> =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  observable as ObservableNode<A>;
