// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding. This file is the one place an observable is a class (why is
// on `ObservableNode` below), so those four rules are waived for it (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import type { Optional } from 'ts-data-forge';
import type { MutableSet } from 'ts-type-forge';
import type {
  InitializedObservable,
  Observable,
  ObservableKind,
  Operator,
  Subscription,
  UpdateToken,
} from '../types/index.mjs';
import { notUpdatedYet, observableBrand } from '../utils/index.mjs';
import {
  completeNode,
  disposeNode,
  managersOf,
  subscribe,
  tryUpdateNotImplemented,
} from './create-observable-base.mjs';
import type { MutableNodeRecord, NodeRecord } from './observable-node.mjs';

/**
 * Creates a new observable. The caller fills in `tryUpdate` and the hooks
 * once `init` has returned them, then calls {@link adoptIntoCurrentScope}.
 */
export const createNodeRecord = <A,>(
  kind: ObservableKind,
  depth: number,
  parents: readonly Observable<unknown>[] | undefined,
  initialValue: Optional<A>,
): NodeRecord<A> => new ObservableNode(kind, depth, parents, initialValue);

/**
 * An observable, and the reason it is a class (#2421).
 *
 * A node is created for every derived value of a UI, so creating one has to
 * be cheap, and most of its cost was its methods: each observable used to be
 * a set of closures made for it, a dozen or more per node. Sharing the
 * methods among all nodes removes that cost, and a shared method has to read
 * the node it is called on from `this`. Once `this` is unavoidable, a class
 * is the plainest way to say it: the methods live once on the prototype,
 * `this` is typed, and assigning every field in the constructor in one order
 * gives all nodes one shape for V8. The alternatives measured no faster and
 * read worse: an object literal holding shared `function`s that read `this`
 * needs the same `this` plus a slot per method on every node and a Sumi
 * marker on every line, and a prototype from `Object.create` filled field by
 * field was several times slower.
 *
 * The methods read the observable they are called on, so taking one off it
 * (`const { subscribe } = obs$`) is not supported. Only the constructor and
 * the methods are here; the functions in `create-observable-base.mts` read
 * and write the fields as a {@link NodeRecord}.
 */
class ObservableNode<A> implements MutableNodeRecord<A> {
  // `declare`d and assigned in the constructor, all in one order: a class
  // field with an initializer is defined rather than assigned, which made
  // creating a node about half again as slow.
  declare readonly kind: ObservableKind;
  declare readonly depth: number;
  declare readonly isCompleted: boolean;
  declare readonly updateToken: UpdateToken;
  declare readonly hasSubscriber: boolean;
  declare readonly hasChild: boolean;
  declare readonly parents: readonly Observable<unknown>[] | undefined;
  declare readonly snapshot: Optional<A>;
  declare readonly children: MutableSet<NodeRecord<unknown>> | undefined;
  declare readonly subscribers: MutableNodeRecord<A>['subscribers'];
  declare readonly teardowns: readonly (() => void)[] | undefined;
  declare readonly tryUpdate: (updateToken: UpdateToken) => void;
  declare readonly canEmitNoMore: (() => boolean) | undefined;
  declare readonly flush: (() => void) | undefined;
  declare readonly descendants: MutableNodeRecord<A>['descendants'];
  declare readonly managers: readonly NodeRecord<unknown>[];
  declare readonly isRegistered: boolean;
  declare readonly isPropagating: boolean;
  declare readonly joinedDuringUpdate:
    MutableSet<NodeRecord<unknown>> | undefined;
  declare readonly releaseFromScope: (() => void) | undefined;
  declare readonly [observableBrand]: true;

  constructor(
    kind: ObservableKind,
    depth: number,
    parents: readonly Observable<unknown>[] | undefined,
    initialValue: Optional<A>,
  ) {
    this.kind = kind;

    this.depth = depth;

    this.isCompleted = false;

    this.updateToken = notUpdatedYet;

    this.hasSubscriber = false;

    this.hasChild = false;

    this.parents = parents;

    this.snapshot = initialValue;

    this.children = undefined;

    this.subscribers = undefined;

    this.teardowns = undefined;

    this.tryUpdate = tryUpdateNotImplemented;

    this.canEmitNoMore = undefined;

    this.flush = undefined;

    this.descendants = kind === 'sync child' ? undefined : [];

    this.managers = kind === 'sync child' ? managersOf(parents ?? []) : [this];

    this.isRegistered = false;

    this.isPropagating = false;

    this.joinedDuringUpdate = undefined;

    this.releaseFromScope = undefined;

    this[observableBrand] = true;
  }

  getSnapshot(): Optional<A> {
    return this.snapshot;
  }

  subscribe(onNext: (v: A) => void, onComplete?: () => void): Subscription {
    return subscribe(this, onNext, onComplete);
  }

  // A `WithInitialValueOperator` is also an `Operator`: nothing at run time
  // tells the two apart, and the public types refine the return type (#1952).
  pipe<B>(operator: Operator<A, B>): Observable<B> {
    return operator(toInitialized<A>(this));
  }

  complete(): void {
    completeNode(this);
  }

  dispose(): void {
    disposeNode(this);
  }

  hasActiveChild(): boolean {
    if (this.children === undefined) {
      return false;
    }

    for (const c of this.children) {
      if (!c.isCompleted) {
        return true;
      }
    }

    return false;
  }
}

const toInitialized = <A,>(node: ObservableNode<A>): InitializedObservable<A> =>
  // The node is the observable; the public types are only a view of it.
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  node as unknown as InitializedObservable<A>;
