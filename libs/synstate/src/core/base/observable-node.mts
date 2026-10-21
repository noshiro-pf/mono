// cspell:ignore bivariant
import type { Optional } from 'ts-data-forge';
import type {
  BivariantHack,
  Mutable,
  MutableSet,
  StrictOmit,
} from 'ts-type-forge';
import type {
  AsyncChildObservable,
  NonEmptyUnknownList,
  Observable,
  ObservableBase,
  ObservableKind,
  RootObservable,
  SyncChildObservable,
  UpdateToken,
} from '../types/index.mjs';
import type { observableBrand } from '../utils/index.mjs';

/**
 * What every observable is at run time: one record of data whose public
 * methods (`subscribe`, `getSnapshot`, `pipe`, `complete`, `dispose`) are on
 * its class's prototype. Propagation reads and writes the fields directly
 * through the functions in `create-observable-base.mts`.
 *
 * Until 2026-10 each observable was a set of closures — a dozen or more per
 * node, plus a `Set` of children and a `Map` of subscribers made up front —
 * and building them was most of what creating a node cost. An instance of
 * the class in `node-class.mts`, whose methods are on its prototype, costs
 * one object, and the collections are made when the first child or
 * subscriber arrives.
 *
 * Only `core/base`, which index generation excludes from the package, sees
 * this type, and only through {@link asMutable} does it write it.
 */
export type NodeRecord<A> = Readonly<{
  kind: ObservableKind;
  depth: number;
  isCompleted: boolean;
  updateToken: UpdateToken;
  hasSubscriber: boolean;
  hasChild: boolean;

  /** The parents of a child; `undefined` for a root. */
  parents: readonly Observable<unknown>[] | undefined;

  snapshot: Optional<A>;

  /** Made when the first child arrives. */
  children: ReadonlySet<NodeRecord<unknown>> | undefined;

  /** Made when the first subscriber arrives. */
  subscribers: ReadonlySet<NodeSubscriber<A>> | undefined;

  /** Made when the first teardown is registered. */
  teardowns: readonly (() => void)[] | undefined;

  tryUpdate: (updateToken: UpdateToken) => void;

  /** See `SyncChildObservableHooks.canEmitNoMore`. */
  canEmitNoMore: (() => boolean) | undefined;

  /** See `AsyncChildObservableHooks.flush`. */
  flush: (() => void) | undefined;

  /**
   * The descendants a root or an async child propagates its own updates to;
   * `undefined` for a sync child.
   */
  descendants: ManagerState | undefined;

  /**
   * The managers this node's own descendants register to: itself for a
   * manager, its parents' for a sync child, shared with its parent when it
   * has one. Cached so that creating a child does not walk its ancestors.
   */
  managers: readonly NodeRecord<unknown>[];

  /** Whether the node is in its parents' and managers' lists. */
  isRegistered: boolean;

  /** Whether this node, as a manager, is propagating an update of its own. */
  isPropagating: boolean;

  /**
   * The descendants that registered to this manager while it propagated the
   * update under way, which that update does not visit; made when the first
   * one arrives. Kept on the manager rather than in a module, so that it
   * also holds for a node another copy of synstate registered.
   */
  joinedDuringUpdate: ReadonlySet<NodeRecord<unknown>> | undefined;

  /** Set when a scope adopted this node at creation. */
  releaseFromScope: (() => void) | undefined;

  // The class's methods (`node-class.mts`); the public types describe them.
  getSnapshot: unknown;
  subscribe: unknown;
  pipe: unknown;
  complete: unknown;
  dispose: unknown;
  hasActiveChild: unknown;

  [observableBrand]: true;
}>;

/**
 * The same record, as the functions in `create-observable-base.mts` write it.
 * They take a {@link NodeRecord} and turn it into this with {@link asMutable}
 * at the point of writing, so that no parameter is a mutable type.
 */
export type MutableNodeRecord<A> = Mutable<
  StrictOmit<
    NodeRecord<A>,
    | 'children'
    | 'descendants'
    | 'subscribers'
    | 'teardowns'
    | 'joinedDuringUpdate'
  >
> &
  Mutable<
    Readonly<{
      children: MutableSet<NodeRecord<unknown>> | undefined;
      subscribers: MutableSet<NodeSubscriber<A>> | undefined;
      teardowns: readonly (() => void)[] | undefined;
      descendants: MutableManagerState | undefined;
      joinedDuringUpdate: MutableSet<NodeRecord<unknown>> | undefined;
    }>
  >;

/**
 * The descendants of a manager, by depth: the set at index `i` holds those at
 * `depth + 1 + i` of the manager, in the order they registered. Depths below
 * a live node never skip one (every live node has a live parent one level
 * up), so the array has few holes; a hole is `undefined`, never a gap left
 * for V8 to treat as a holey array.
 *
 * `startUpdate` walks this array and its sets in place. Adding or removing a
 * node is O(1) and there is no flat order to rebuild; only the first node of
 * a depth replaces the array with a longer copy. A node deleted during
 * the walk is skipped by the set's iterator; a node registered during it
 * is also put in `joinedDuringUpdate` and skipped, so an update visits the
 * nodes that existed when it began.
 */
export type ManagerState = readonly (
  ReadonlySet<NodeRecord<unknown>> | undefined
)[];

type MutableManagerState = readonly (
  MutableSet<NodeRecord<unknown>> | undefined
)[];

/**
 * A subscriber as a record holds it. `onNext` is bivariant in its parameter,
 * so that a record of any value type can be held as a `NodeRecord<unknown>`
 * (a parent's children, a manager's descendants); a plain function type
 * would make the record invariant in `A`.
 */
type NodeSubscriber<A> = Readonly<{
  onNext: BivariantHack<(v: A) => void>;
  onComplete: () => void;
}>;

/** The one place a record is written to; see {@link MutableNodeRecord}. */
export const asMutable = <A,>(node: NodeRecord<A>): MutableNodeRecord<A> =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  node as MutableNodeRecord<A>;

/**
 * The members propagation reads on every observable, which the public types
 * leave out (#2117). Tests reach them through {@link toNode}.
 */
type NodeInternals = Readonly<{
  hasSubscriber: boolean;
  hasChild: boolean;
  hasActiveChild: () => boolean;
  tryUpdate: (updateToken: UpdateToken) => void;
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
> = AsyncChildObservable<A, P> & NodeInternals;

export type RootObservableNode<A> = NodeInternals & RootObservable<A>;

export type ChildObservableNode<
  A,
  P extends NonEmptyUnknownList = NonEmptyUnknownList,
> = AsyncChildObservableNode<A, P> | SyncChildObservableNode<A, P>;

export type ObservableNode<A> =
  | AsyncChildObservableNode<A>
  | RootObservableNode<A>
  | SyncChildObservableNode<A>;

/**
 * The one place a public observable is seen as the node it is. Every
 * observable is built by a synstate factory, which always makes a
 * {@link NodeRecord}, and the public types carry a brand an object literal
 * cannot supply, so this holds for every value of those types.
 */
export const toNode = <A,>(observable: Observable<A>): ObservableNode<A> =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  observable as ObservableNode<A>;

/** {@link toNode}, for the code in `core/base` that writes the record. */
export const toRecord = <A,>(observable: Observable<A>): NodeRecord<A> =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  observable as unknown as NodeRecord<A>;
