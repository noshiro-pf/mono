// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding. The observables are classes (why is on `ObservableBaseClass`
// below), so those four rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Optional } from 'ts-data-forge';
import { unreachable } from 'ts-std-forge';
import type { MutableSet } from 'ts-type-forge';
import type {
  DropInitialValueOperator,
  InitializedObservable,
  KeepInitialValueOperator,
  Observable,
  ObservableBase,
  ObservableKind,
  Operator,
  Subscriber,
  Subscription,
  UpdateToken,
  WithInitialValueOperator,
} from '../types/index.mjs';
import {
  getCurrentScopeInternals,
  issueUnqueuedToken,
  notUpdatedYet,
  observableBrand,
  runUndoingOnThrow,
  runWithScope,
  type ScopeInternals,
  type ScopeSubscription,
} from '../utils/index.mjs';
import type { ChildNode } from './observable-node.mjs';
import { enqueueChildren } from './propagation-state.mjs';

/**
 * The base of every observable, and the reason an observable is a class.
 *
 * A node is created for every derived value of a UI, so creating one has to be
 * cheap, and most of its cost was its methods: each observable used to be a set
 * of closures made for it, a dozen or more per node (#2421). Sharing the
 * methods among all nodes removes that cost, and a shared method has to read
 * the node it is called on from `this`. Once `this` is unavoidable, a class is
 * the plainest way to say it: the methods live once on the prototype, `this` is
 * typed, a creator or operator is a subclass that overrides `tryUpdate` (and
 * `flush` / `teardown` where it holds something), and assigning every field in
 * the constructor gives the nodes of one class one shape for V8. The
 * collections (`children`, subscribers) are made when the first one arrives.
 *
 * The methods read the observable they are called on, so taking one off it
 * (`const { subscribe } = obs$`) is not supported.
 *
 * A node reaches another node only through its methods and its public fields,
 * never through a `#private` one: the other node may be an instance of another
 * copy of synstate in the same program, whose classes are not these.
 */
export class ObservableBaseClass<
  A,
  Kind extends ObservableKind,
  Depth extends number,
> implements ObservableBase<A> {
  #mut_snapshot: Optional<A>;
  #mut_isCompleted: boolean;
  #mut_updateToken: UpdateToken;
  #mut_children: MutableSet<ChildNode> | undefined;
  #mut_subscribers: MutableSet<OrderedSubscriber<A>> | undefined;
  #mut_scope: ScopeInternals | undefined;
  #mut_queuedFor: UpdateToken | undefined;
  readonly kind: Kind;
  readonly depth: Depth;
  declare readonly [observableBrand]: true;

  constructor({
    kind,
    depth,
    initialValue,
  }: Readonly<{
    kind: Kind;
    depth: Depth;
    initialValue: Optional<A>;
  }>) {
    this.kind = kind;

    this.depth = depth;

    this.#mut_snapshot = initialValue;

    this.#mut_isCompleted = false;

    this.#mut_updateToken = notUpdatedYet;

    this.#mut_queuedFor = undefined;

    this.#mut_children = undefined;

    this.#mut_subscribers = undefined;

    this.#mut_scope = undefined;

    this[observableBrand] = true;
  }

  /** Adds `subscriber`, making the set on the first one. */
  #addSubscriber(subscriber: OrderedSubscriber<A>): void {
    this.#mut_subscribers ??= new Set<OrderedSubscriber<A>>();

    this.#mut_subscribers.add(subscriber);
  }

  /**
   * Adds `onNext` and `onComplete` as a subscriber, to the current scope's
   * subscriptions if a scope runs, or calls `onComplete` at once if the
   * observable has completed.
   */
  #register(
    onNext: (v: A) => void,
    onComplete: (() => void) | undefined,
  ): Subscription {
    if (this.#mut_isCompleted) {
      onComplete?.();

      return noopSubscription;
    }

    const scope = getCurrentScopeInternals();

    if (scope === undefined) {
      const unscoped: OrderedSubscriber<A> = {
        onNext,
        onComplete: onComplete ?? noop,
        order: nextSubscriberOrder(),
      } as const;

      this.#addSubscriber(unscoped);

      return {
        unsubscribe: () => {
          this.#mut_subscribers?.delete(unscoped);
        },
      };
    }

    const scoped = new ScopedSubscriber(this, scope, onNext, onComplete);

    this.#addSubscriber(scoped);

    scope.adoptSubscription(scoped);

    return {
      unsubscribe: () => {
        scoped.unsubscribe();
      },
    };
  }

  getSnapshot(): Optional<A> {
    return this.#mut_snapshot;
  }

  get isCompleted(): boolean {
    return this.#mut_isCompleted;
  }

  get updateToken(): UpdateToken {
    return this.#mut_updateToken;
  }

  get hasSubscriber(): boolean {
    return (
      this.#mut_subscribers !== undefined && this.#mut_subscribers.size > 0
    );
  }

  get hasChild(): boolean {
    return this.#mut_children !== undefined && this.#mut_children.size > 0;
  }

  hasActiveChild(): boolean {
    if (this.#mut_children !== undefined) {
      for (const c of this.#mut_children) {
        if (!c.isCompleted) {
          return true;
        }
      }
    }

    return false;
  }

  get queuedFor(): UpdateToken | undefined {
    return this.#mut_queuedFor;
  }

  setQueuedFor(updateToken: UpdateToken): void {
    this.#mut_queuedFor = updateToken;
  }

  addChild(child: ChildNode): void {
    // A set, not an array: a completed child removes itself, and that has to be
    // O(1) for a UI that creates and completes derived nodes on every mount.
    if (this.#mut_children === undefined) {
      this.#mut_children = new Set<ChildNode>([child]);
    } else {
      this.#mut_children.add(child);
    }
  }

  deleteChild(child: ChildNode): void {
    this.#mut_children?.delete(child);
  }

  deleteSubscriber(subscriber: OrderedSubscriber<A>): void {
    this.#mut_subscribers?.delete(subscriber);
  }

  /**
   * Stores `nextValue` as the current value, queues the children for the update
   * `updateToken`, and notifies subscribers. The children are queued first, so
   * that a child a subscriber creates, which starts from this value, is not
   * visited for it again.
   */
  protected setNext(nextValue: A, updateToken: UpdateToken): void {
    // A completed observable emits nothing more: a custom operator may call
    // `setNext` after completing itself, in `tryUpdate` or later.
    if (this.#mut_isCompleted) {
      return;
    }

    this.#mut_updateToken = updateToken;

    this.#mut_snapshot = Optional.some(nextValue);

    if (this.#mut_children !== undefined) {
      enqueueChildren(this.#mut_children, updateToken);
    }

    if (this.#mut_subscribers === undefined) {
      return;
    }

    // A subscriber added while these are called (one of them subscribed) has
    // been given this value, or a newer one, by `subscribe` already, and
    // iterating a `Set` reaches what is added to it: it is told from the next
    // value on. Each one is tested, though the first added too late could end
    // the loop: skipping costs a comparison for the few added meanwhile, and
    // does not rest on every subscriber being numbered at the moment it is
    // added.
    const end = mut_subscriberOrder.next;

    for (const s of this.#mut_subscribers) {
      if (s.order < end) {
        s.onNext(nextValue);
      }
    }
  }

  /**
   * Stores `nextValue` and returns `true` when nothing observes this observable
   * — no child to queue and no subscriber to call — so that the caller need not
   * open an update; returns `false`, storing nothing, otherwise. The value
   * still gets a token of its own, so that whoever stored the last one sees
   * that it emitted.
   */
  protected setNextIfUnobserved(nextValue: A): boolean {
    // No completed check, unlike `setNext`: its one caller, `startUpdate`,
    // makes it first.
    if (this.hasChild || this.hasSubscriber) {
      return false;
    }

    this.#mut_updateToken = issueUnqueuedToken();

    this.#mut_snapshot = Optional.some(nextValue);

    return true;
  }

  /**
   * Called with the token of every update that reaches this observable; a
   * parent that did not emit in that update has a different `updateToken`.
   * Every observable that can receive a parent update overrides it, and an
   * observable with no parents never gets one, so reaching this is the
   * invariant breaking (Sumi D-48).
   */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  tryUpdate(_updateToken: UpdateToken): void {
    unreachable();
  }

  /**
   * Called by a parent that has completed. A root has no parents, and a child
   * completing never completes it (#2133), so only its own `complete()` ends
   * it.
   */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  tryComplete(): void {}

  /**
   * Completes the observable: an async child first passes on what it still
   * holds (`flush`), then it is disposed. Completing never reaches the parents:
   * an upstream observable may be shared, and only whoever owns it decides when
   * it ends (#2133).
   */
  complete(): void {
    if (this.#mut_isCompleted) {
      return;
    }

    // `flush` emits through `startUpdate` and `dispose` notifies, and each
    // leaves the current scope itself.
    this.flush();

    this.dispose();
  }

  /**
   * Completes the observable without passing on anything it still holds, runs
   * its teardown, and takes it out of the graph.
   */
  dispose(): void {
    // A completed node is reached again through every parent that completes
    // after it; running again would repeat the teardown and the unregistering.
    if (this.#mut_isCompleted) {
      return;
    }

    // Completing is not part of the scope that happens to be running, as an
    // update is not (`startUpdate`): what a subscriber or a child does on
    // hearing it must not join that scope.
    if (getCurrentScopeInternals() !== undefined) {
      runWithScope(undefined, () => {
        this.dispose();
      });

      return;
    }

    // `isCompleted` turns true after the teardown, so a teardown that throws
    // leaves the observable as it was, and a value the teardown makes it emit
    // (the last value of a custom root, which has no `flush`, or one a
    // subscribable delivers from inside `unsubscribe`) still propagates.
    // Re-entry is not guarded yet: a `complete()` a subscriber calls on hearing
    // that value runs every teardown again, without end if one emits every
    // time. It takes a teardown that emits and a subscriber that completes this
    // observable on that value. A guard has to settle too what a retry after a
    // teardown that throws runs again, and when a teardown registered during
    // the teardown runs.
    this.teardown();

    this.#mut_isCompleted = true;

    if (this.#mut_scope !== undefined) {
      this.#mut_scope.release();

      this.#mut_scope = undefined;
    }

    if (this.#mut_subscribers !== undefined) {
      for (const s of this.#mut_subscribers) {
        s.onComplete();
      }

      this.#mut_subscribers.clear();
    }

    // A child that completes removes itself from `children` during this loop,
    // which iterating a `Set` tolerates.
    if (this.#mut_children !== undefined) {
      for (const c of this.#mut_children) {
        c.tryComplete();
      }
    }

    this.detach();
  }

  /**
   * Passes on what the observable still holds, at the beginning of `complete()`
   * and never in `dispose()` (`debounce`'s pending value).
   */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  protected flush(): void {}

  /**
   * Releases what the observable holds (timers, subscriptions, inner
   * observables), once, when it completes or is disposed, before its
   * subscribers hear of it.
   */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  protected teardown(): void {}

  /** Takes a completed child out of its parents' lists. */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  protected detach(): void {}

  /**
   * Joins the scope whose `run` is executing (`createScope`), if any. A node
   * that completed while it was built (`just`, a child of completed parents)
   * has nothing left to release.
   */
  protected adoptIntoCurrentScope(): void {
    const scope = getCurrentScopeInternals();

    if (scope === undefined || this.#mut_isCompleted) {
      return;
    }

    scope.adopt(this);

    this.#mut_scope = scope;
  }

  // A `WithInitialValueOperator` is also an `Operator`: nothing at run time
  // tells the operators apart, and the overloads only refine the return type
  // (#1952).
  pipe<B>(operator: WithInitialValueOperator<A, B>): InitializedObservable<B>;

  pipe<B>(
    operator: DropInitialValueOperator<A, B> | KeepInitialValueOperator<A, B>,
  ): Observable<B>;

  pipe<B>(operator: Operator<A, B>): Observable<B> {
    return operator(
      // The node is the observable; the public types are only a view of it.
      // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
      this as unknown as InitializedObservable<A>,
    );
  }

  /**
   * Calls `onNext` with the current value, if any, and with every later one,
   * and `onComplete` once the observable completes.
   *
   * A subscription made while a scope runs (`createScope`) belongs to it, as an
   * observable created there does: disposing the scope unsubscribes it.
   * Outside every scope, and inside `untracked`, it lasts until `unsubscribe`
   * or completion.
   *
   * A value the first call writes to the observable itself (a clamp, a default)
   * is passed to `onNext` as well, once, after the first call has returned,
   * unless that call disposed the scope the subscription is made in. If passing
   * it on throws, the subscription is ended before the exception goes on.
   *
   * A subscription made while the observable is calling its subscribers (one of
   * them subscribed) is not called again by that delivery: `subscribe` has
   * given it the current value, and the observable calls it from the next value
   * on.
   */
  subscribe(onNext: (v: A) => void, onComplete?: () => void): Subscription {
    if (Optional.isNone(this.#mut_snapshot)) {
      return this.#register(onNext, onComplete);
    }

    const updateToken = this.#mut_updateToken;

    // first emit
    onNext(Optional.unwrap(this.#mut_snapshot));

    // `onNext` is not a subscriber while its first call runs, so what that call
    // wrote to this observable has reached no one (#3280). Unless the call
    // disposed the scope it subscribes in, the latest value is passed on once
    // more, now that the call has returned.
    if (
      this.#mut_updateToken === updateToken ||
      getCurrentScopeInternals()?.isDisposed === true
    ) {
      return this.#register(onNext, onComplete);
    }

    const latest = Optional.unwrap(this.#mut_snapshot);

    // Before a completion that followed the write.
    if (this.#mut_isCompleted) {
      onNext(latest);

      return this.#register(onNext, onComplete);
    }

    const subscription = this.#register(onNext, onComplete);

    // The caller never receives a subscription whose pass-on threw, so it is
    // ended here.
    runUndoingOnThrow(
      () => {
        onNext(latest);
      },
      () => {
        subscription.unsubscribe();
      },
    );

    return subscription;
  }
}

/**
 * A subscription made while a scope runs: one object that is the subscriber,
 * the scope's entry for it and what `unsubscribe` ends, so that a subscription
 * costs a scope one entry. The scope ends it when disposed, and is told once it
 * ends on its own (`unsubscribe`, completion), so that a long-lived scope does
 * not keep every subscription it ever saw.
 */
class ScopedSubscriber<A> implements OrderedSubscriber<A>, ScopeSubscription {
  // Cleared once it ends, so that an entry its scope still lists until the next
  // compaction holds neither the observable nor the callbacks.
  #mut_observable: ObservableBaseClass<A, ObservableKind, number> | undefined;
  #mut_onNext: ((v: A) => void) | undefined;
  #mut_onComplete: (() => void) | undefined;
  readonly #scope: ScopeInternals;
  readonly order: number;

  constructor(
    observable: ObservableBaseClass<A, ObservableKind, number>,
    scope: ScopeInternals,
    onNext: (v: A) => void,
    onComplete: (() => void) | undefined,
  ) {
    this.order = nextSubscriberOrder();

    this.#mut_observable = observable;

    this.#mut_onNext = onNext;

    this.#mut_onComplete = onComplete;

    this.#scope = scope;
  }

  /** Drops what an ended subscription no longer needs. */
  #forget(): void {
    this.#mut_observable = undefined;

    this.#mut_onNext = undefined;

    this.#mut_onComplete = undefined;
  }

  get isEnded(): boolean {
    return this.#mut_observable === undefined;
  }

  onNext(v: A): void {
    this.#mut_onNext?.(v);
  }

  onComplete(): void {
    const onComplete = this.#mut_onComplete;

    this.#forget();

    this.#scope.subscriptionGone();

    onComplete?.();
  }

  end(): void {
    this.#mut_observable?.deleteSubscriber(this);

    this.#forget();
  }

  unsubscribe(): void {
    if (this.#mut_observable === undefined) {
      return;
    }

    this.end();

    this.#scope.subscriptionGone();
  }
}

const noopSubscription: Subscription = { unsubscribe: () => {} } as const;

const noop = (): void => {};

/**
 * A subscriber and when it was added, among all subscribers of this copy:
 * `setNext` calls only those added before it started.
 */
type OrderedSubscriber<A> = Subscriber<A> & Readonly<{ order: number }>;

// One counter for every observable, not one per node: a node is created for
// every derived value of a UI and most never have a subscriber, so a field on
// each would cost more than a counter that only grows. It stays exact for 2^53
// subscriptions.
const mut_subscriberOrder: { next: number } = { next: 0 };

const nextSubscriberOrder = (): number => {
  const order = mut_subscriberOrder.next;

  mut_subscriberOrder.next = order + 1;

  return order;
};
