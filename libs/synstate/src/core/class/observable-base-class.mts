// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding. The observables are classes (why is on
// `ObservableBaseClass` below), so those four rules are waived here (D-63).
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
  notUpdatedYet,
  observableBrand,
  toSubscriber,
  type ScopeInternals,
} from '../utils/index.mjs';
import type { ChildNode } from './observable-node.mjs';
import { enqueueChildren } from './propagation-state.mjs';

/**
 * The base of every observable, and the reason an observable is a class.
 *
 * A node is created for every derived value of a UI, so creating one has to
 * be cheap, and most of its cost was its methods: each observable used to be
 * a set of closures made for it, a dozen or more per node (#2421). Sharing
 * the methods among all nodes removes that cost, and a shared method has to
 * read the node it is called on from `this`. Once `this` is unavoidable, a
 * class is the plainest way to say it: the methods live once on the
 * prototype, `this` is typed, a creator or operator is a subclass that
 * overrides `tryUpdate` (and `flush` / `teardown` where it holds something),
 * and assigning every field in the constructor gives the nodes of one class
 * one shape for V8. The collections (`children`, subscribers) are made when
 * the first one arrives.
 *
 * The methods read the observable they are called on, so taking one off it
 * (`const { subscribe } = obs$`) is not supported.
 *
 * A node reaches another node only through its methods and its public
 * fields, never through a `#private` one: the other node may be an instance
 * of another copy of synstate in the same program, whose classes are not
 * these.
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
  #mut_subscribers: MutableSet<Subscriber<A>> | undefined;
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
    // A set, not an array: a completed child removes itself, and that has to
    // be O(1) for a UI that creates and completes derived nodes on every mount.
    if (this.#mut_children === undefined) {
      this.#mut_children = new Set<ChildNode>([child]);
    } else {
      this.#mut_children.add(child);
    }
  }

  deleteChild(child: ChildNode): void {
    this.#mut_children?.delete(child);
  }

  /**
   * Stores `nextValue` as the current value, queues the children for the
   * update `updateToken`, and notifies subscribers. The children are queued
   * first, so that a child a subscriber creates, which starts from this
   * value, is not visited for it again.
   */
  protected setNext(nextValue: A, updateToken: UpdateToken): void {
    this.#mut_updateToken = updateToken;

    this.#mut_snapshot = Optional.some(nextValue);

    if (this.#mut_children !== undefined) {
      enqueueChildren(this.#mut_children, updateToken);
    }

    if (this.#mut_subscribers !== undefined) {
      for (const s of this.#mut_subscribers) {
        s.onNext(nextValue);
      }
    }
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
   * holds (`flush`), then it is disposed. Completing never reaches the
   * parents: an upstream observable may be shared, and only whoever owns it
   * decides when it ends (#2133).
   */
  complete(): void {
    if (this.#mut_isCompleted) {
      return;
    }

    this.flush();

    this.dispose();
  }

  /**
   * Completes the observable without passing on anything it still holds,
   * runs its teardown, and takes it out of the graph.
   */
  dispose(): void {
    // A completed node is reached again through every parent that completes
    // after it; running again would repeat the teardown and the unregistering.
    if (this.#mut_isCompleted) {
      return;
    }

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
   * Passes on what the observable still holds, at the beginning of
   * `complete()` and never in `dispose()` (`debounce`'s pending value).
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

  subscribe(onNext: (v: A) => void, onComplete?: () => void): Subscription {
    // first emit
    if (Optional.isSome(this.#mut_snapshot)) {
      onNext(this.#mut_snapshot.value);
    }

    if (this.#mut_isCompleted) {
      onComplete?.();

      return noopSubscription;
    }

    const subscriber = toSubscriber(onNext, onComplete);

    this.#mut_subscribers ??= new Set<Subscriber<A>>();

    this.#mut_subscribers.add(subscriber);

    return {
      unsubscribe: () => {
        this.#mut_subscribers?.delete(subscriber);
      },
    };
  }
}

const noopSubscription: Subscription = { unsubscribe: () => {} } as const;
