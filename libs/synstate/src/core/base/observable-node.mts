// cspell:ignore bivariance bivariant
import type { Optional } from 'ts-data-forge';
import type {
  Mutable,
  MutableMap,
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
 * What every observable is at run time: one plain record of data that holds
 * the public methods (`subscribe`, `getSnapshot`, `pipe`, `complete`,
 * `dispose`) as functions every record shares. Propagation reads and writes the fields directly
 * through the functions in `create-observable-base.mts`.
 *
 * Until 2026-10 each observable was a set of closures — a dozen or more per
 * node, plus a `Set` of children and a `Map` of subscribers made up front —
 * and building them was most of what creating a node cost. A record with
 * shared methods costs one object, and the collections are made when the
 * first child or subscriber arrives.
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
  manager: ManagerState | undefined;

  /**
   * The managers this node's own descendants register to: itself for a
   * manager, its parents' for a sync child, shared with its parent when it
   * has one. Cached so that creating a child does not walk its ancestors.
   */
  managers: readonly NodeRecord<unknown>[];

  /** Whether the node is in its parents' and managers' lists. */
  isRegistered: boolean;

  /** Set when a scope adopted this node at creation. */
  releaseFromScope: (() => void) | undefined;

  // The shared methods (`observableMethods`); the public types describe them.
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
    'children' | 'manager' | 'subscribers' | 'teardowns'
  >
> &
  Mutable<
    Readonly<{
      children: MutableSet<NodeRecord<unknown>> | undefined;
      subscribers: MutableSet<NodeSubscriber<A>> | undefined;
      teardowns: readonly (() => void)[] | undefined;
      manager: MutableManagerState | undefined;
    }>
  >;

/**
 * A subscriber as a record holds it. Method syntax makes the parameter
 * bivariant, so that a record of any value type can be held as a
 * `NodeRecord<unknown>` (a parent's children, a manager's descendants).
 */
type NodeSubscriber<A> = Readonly<{
  // @sumi-expect-error banned-syntax/no-method-shorthand
  // eslint-disable-next-line functional/prefer-property-signatures -- for the bivariance described above
  onNext(v: A): void;

  // @sumi-expect-error banned-syntax/no-method-shorthand
  // eslint-disable-next-line functional/prefer-property-signatures -- for the bivariance described above
  onComplete(): void;
}>;

/**
 * The depth-ordered descendants of a manager. They are kept in one
 * insertion-ordered set per depth, so adding and removing one is O(1) apart
 * from the first node of a new depth. The flat array `startUpdate` walks is
 * rebuilt only when an update finds it stale; that also keeps the walk a
 * snapshot — a node created or completed while an update is propagating does
 * not change which nodes that update visits.
 */
export type ManagerState = Readonly<{
  buckets: ReadonlyMap<number, ReadonlySet<NodeRecord<unknown>>>;

  /** The keys of `buckets`, ascending. */
  depths: readonly number[];

  /** `undefined` while stale. */
  order: readonly NodeRecord<unknown>[] | undefined;
}>;

type MutableManagerState = Mutable<
  Readonly<{
    buckets: MutableMap<number, MutableSet<NodeRecord<unknown>>>;
    depths: readonly number[];
    order: readonly NodeRecord<unknown>[] | undefined;
  }>
>;

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
