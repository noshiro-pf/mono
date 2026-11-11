/**
 * The run-time classes behind every observable and every effect.
 *
 * A node is created for every derived value of a UI, so its methods live on the
 * prototype and its collections are made when the first entry arrives. The
 * public types (`Observable`, `InitializedObservable`) are views of these
 * classes; `toNode` turns a public observable back into its class.
 */
import { Optional, type Some } from 'ts-std-forge';
import { canPublishNow, EventQueue } from './event-queue.mjs';
import {
  adoptIntoCurrentOwner,
  currentDepthFloor,
  type Failure,
} from './owner.mjs';
import {
  awaitsEffects,
  batch,
  currentEpoch,
  emit,
  holdUntilUpdateEnds,
  isPending,
  writeCount,
  type DerivedNode,
  type EffectNode,
  type QueuedNode,
} from './scheduler.mjs';
import type { Observable, Operator, Unsubscribe } from './types.mjs';

/** The value of a node that holds none yet. Never seen outside the package. */
export const noValue: unique symbol = Symbol('synstate-next/no-value');

/**
 * The last `Some` each node's `getSnapshot` built, holding that node's value;
 * see there.
 */
const snapshots = new WeakMap<ObservableClass<unknown>, Some<unknown>>();

export type NoValue = typeof noValue;

/**
 * The base of every observable. A subclass either has parents and overrides
 * `recompute` (see `DerivedClass`), or emits by itself through `publish`.
 */
export class ObservableClass<A> implements DerivedNode {
  /** Disposed entries left in `children`. */
  #mut_dead: number;

  /**
   * The values of `publishEvent` that wait; made on the first one. Typed by
   * what the node uses, in method syntax, so that `A` stays covariant.
   */
  #mut_events: EventSink<A> | undefined;

  /** The value held, or {@link noValue}. Written only by the node itself. */
  // transformer-ignore-next-line convert-to-readonly
  current: A | NoValue;

  readonly depth: number;

  /** Children and effects. Disposed entries are compacted lazily. */
  // transformer-ignore-next-line convert-to-readonly
  children: QueuedNode[] | undefined;

  /** The epoch this node was last queued in. */
  // transformer-ignore-next-line convert-to-readonly
  queuedAt: number;

  /** The epoch this node last emitted in. */
  // transformer-ignore-next-line convert-to-readonly
  changedAt: number;

  readonly bornAt: number;

  // transformer-ignore-next-line convert-to-readonly
  emittedAt: number;

  // transformer-ignore-next-line convert-to-readonly
  disposed: boolean;

  // transformer-ignore-next-line convert-to-readonly
  gone: boolean;

  /**
   * `depth` is what the parents ask for; a node created in an owner with a
   * depth floor (a switch's branch, see `ownerBelow`) goes no higher than it.
   */
  constructor(initial: A | NoValue, depth: number) {
    this.current = initial;

    const floor = currentDepthFloor();

    this.depth = Math.max(depth, floor);

    this.children = undefined;

    this.queuedAt = 0;

    this.changedAt = 0;

    this.bornAt = writeCount();

    this.emittedAt = 0;

    this.disposed = false;

    this.gone = false;

    this.#mut_events = undefined;

    this.#mut_dead = 0;

    adoptIntoCurrentOwner(this);
  }

  /**
   * Read by the queue for every child; tells a node from an effect. A getter,
   * not a field, so that it lives on the prototype rather than in every node.
   */
  /* oxlint-disable typescript/class-literal-property-style */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  get isEffect(): false {
    return false;
  }
  /* oxlint-enable typescript/class-literal-property-style */

  /**
   * Recomputes from the parents; returns whether the value changed. Called only
   * when a parent emitted in the current update. A node without parents is
   * never queued.
   */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  recompute(): boolean {
    return false;
  }

  /**
   * The same `Some` while the value is the same, as `useSyncExternalStore`
   * needs. Built when read, and kept aside in `snapshots` rather than in a
   * field: propagation reads `current`, never this, so a node that is never
   * read pays nothing. The `Some` kept holds the value read last until the next
   * read or until the node is collected.
   */
  getSnapshot(): Optional<A> {
    const v = this.current;

    if (v === noValue) {
      return Optional.none;
    }

    const kept = snapshots.get(this);

    if (kept !== undefined && Object.is(kept.value, v)) {
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- `snapshots` holds this node's own value
      return kept as Some<A>;
    }

    const snapshot = Optional.some(v);

    snapshots.set(this, snapshot);

    return snapshot;
  }

  get value(): A {
    const v = this.current;

    if (v === noValue) {
      throw new Error('synstate-next: this observable holds no value yet.');
    }

    return v;
  }

  /**
   * Whether it will never emit again (`Observable.settled` in core/types.mts
   * says what that means to a user). This base answer is true only once it is
   * disposed with no write waiting for its round; a node that can finish by
   * itself (a timer, a promise, an operator) overrides it. A `mergeMap` lets an
   * inner observable go once it is settled.
   */
  get settled(): boolean {
    // A write made before it was disposed may still wait for its round.
    return this.disposed && !isPending(this);
  }

  /** Whether anything would be reached by an emission. */
  get hasObserver(): boolean {
    return this.children !== undefined && this.children.length > this.#mut_dead;
  }

  /**
   * Registers `child` to be visited when this node emits. A disposed node never
   * emits again, so it does not keep a child made after it was disposed.
   */
  addChild(child: QueuedNode): void {
    if (this.disposed) {
      return;
    }

    if (this.children === undefined) {
      this.children = [child];
    } else {
      this.children.push(child);
    }
  }

  /**
   * Called by a child that was disposed or detached. The child stays in
   * `children` until half of them are gone; the queue skips it meanwhile.
   */
  childGone(): void {
    const mut_children = this.children;

    // A disposed node keeps no children; see `dispose`.
    if (mut_children === undefined) {
      return;
    }

    this.#mut_dead += 1;

    if (this.#mut_dead * 2 < mut_children.length) {
      return;
    }

    let mut_kept = 0;

    for (const child of mut_children) {
      if (child.gone) {
        continue;
      }

      mut_children[mut_kept] = child;

      mut_kept += 1;
    }

    mut_children.splice(mut_kept);

    this.#mut_dead = 0;
  }

  /**
   * Stops being visited, keeping its value, without running any code of the
   * application; its owner disposes it later. See `retireOwner`.
   */
  retire(): void {
    this.leave();

    this.retireHeld();
  }

  /** Leaves the graph for good, keeping its value; see `retire`. */
  protected leave(): void {
    if (this.gone) {
      return;
    }

    this.gone = true;

    this.leaveParents();
  }

  /**
   * Retires the owners this node made for itself and disposes (what an
   * operator's projection or a custom node's setup made), which belong to no
   * other owner: their nodes are made below the floor this node was made at,
   * and go out of the updates with it.
   */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  protected retireHeld(): void {}

  /** Leaves the graph; never emits again. Disposing twice does nothing. */
  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    // A node that left its parents already (see `DerivedClass.detach`) does not
    // tell them again.
    if (!this.gone) {
      this.gone = true;

      this.leaveParents();
    }

    // It never emits again, so its children are let go, and one made from now
    // on is not kept (see `addChild`). A write made before it was disposed and
    // waiting for its round still reaches them; the round lets them go.
    if (!isPending(this)) {
      this.forgetChildren();
    }

    this.#mut_events?.drop();

    this.teardown();
  }

  /** See `DerivedNode.forgetChildren`. */
  forgetChildren(): void {
    this.children = undefined;

    this.#mut_dead = 0;
  }

  /** Tells the parents this node is gone; see `DerivedClass`. */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  protected leaveParents(): void {}

  /** Releases what the node holds besides its parents: timers, inner nodes. */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  protected teardown(): void {}

  /**
   * Emits `value` as an update of its own: from a write, or from an async
   * operator whose timer or inner observable fired. A write made while the
   * graph is draining is deferred by the caller.
   */
  protected publish(value: A): void {
    this.current = value;

    emit(this, this.hasObserver);
  }

  /**
   * Takes `value` as what a recompute passes on in the update under way, and
   * returns whether it did: what `recompute` returns. A value emitted before
   * and not yet seen by this round's effects, or events still queued, are not
   * overwritten or overtaken: `value` follows them, as an event.
   */
  protected passOnInRound(value: A): boolean {
    if (awaitsEffects(this) || this.eventsWaiting) {
      this.publishEvent(value);

      return false;
    }

    this.current = value;

    return true;
  }

  /**
   * Emits `value` as an event: every value is delivered, each in an update of
   * its own and in order, where `publish` keeps the last of those written
   * before their update. May be called while the graph drains.
   */
  protected publishEvent(value: A): void {
    if (this.#mut_events === undefined) {
      if (canPublishNow(this)) {
        this.publish(value);

        return;
      }

      this.#mut_events = new EventQueue(this, (v) => {
        this.publish(v);
      });
    }

    this.#mut_events.push(value);
  }

  /** Whether a value of `publishEvent` waits to be delivered. */
  protected get eventsWaiting(): boolean {
    return this.#mut_events?.waiting ?? false;
  }

  pipe(operator: Operator<unknown, unknown>): Observable<unknown> {
    return operator(view(this));
  }

  /**
   * Calls `fn` with the current value, if any, then after each update. A write
   * `fn` makes during that first call is passed on once the call has returned,
   * as one update with the last value written, as a write made by an effect is:
   * `fn` is never re-entered. If the first call, or the update it starts,
   * throws, the subscription is ended before the exception propagates, even
   * when what threw was another effect: the caller receives no `Unsubscribe`,
   * so nothing else could end it.
   */
  subscribe(fn: (value: A) => void): Unsubscribe {
    const effect = new FnEffect(this, fn);

    const v = this.current;

    if (v !== noValue) {
      try {
        batch(() => {
          fn(v);
        });
      } catch (error) {
        effect.dispose();

        throw error;
      }
    }

    return () => {
      effect.dispose();
    };
  }
}

/**
 * A node with parents. The depth is one more than the deepest parent's, and the
 * node registers with each parent once constructed.
 *
 * `reads` are nodes it reads without following (`withCurrentValueFrom`): they
 * do not wake it, but it is placed below them too, so that it reads the value
 * they settle on in the same update.
 *
 * `emitters` are the parents whose emissions can make it emit, all of them
 * unless a subclass says otherwise; the others only wake it (the notifier of
 * `takeUntil`, the observable `withBufferedFrom` buffers). It is settled once
 * they are.
 */
export class DerivedClass<A> extends ObservableClass<A> {
  readonly parents: readonly ObservableClass<unknown>[];

  constructor(
    parents: readonly ObservableClass<unknown>[],
    initial: A | NoValue,
    reads?: readonly ObservableClass<unknown>[],
  ) {
    super(
      initial,
      reads === undefined
        ? depthBelow(parents)
        : Math.max(depthBelow(parents), depthBelow(reads)),
    );

    this.parents = parents;

    for (const parent of parents) {
      parent.addChild(this);
    }
  }

  /**
   * Stops following the parents for good, keeping the value held: for a node
   * that will never emit again (a `take` that is done), so that its parents no
   * longer visit it or keep it alive. It leaves them as a disposed child does,
   * at no cost per sibling.
   */
  protected detach(): void {
    this.leave();
  }

  /**
   * Settled once it is gone (disposed, or detached for good), or when every
   * parent that can make it emit is, since it emits only when one of them does,
   * and no emission of its own waits for a round.
   */
  override get settled(): boolean {
    return (
      !isPending(this) &&
      (this.gone || this.emitters.every((parent) => parent.settled))
    );
  }

  /**
   * The parents whose emissions can make it emit; see the class comment. A
   * getter, so that a node of the usual kind carries no field for it.
   */
  protected get emitters(): readonly ObservableClass<unknown>[] {
    return this.parents;
  }

  /**
   * Whether `parent` emitted in this update, after this node was created. A
   * node with several parents asks this to tell which of them woke it; one
   * created in the update a parent emitted in read that value already.
   */
  protected emittedNow(parent: ObservableClass<unknown>): boolean {
    return (
      parent.changedAt === currentEpoch() && parent.emittedAt > this.bornAt
    );
  }

  protected override leaveParents(): void {
    for (const parent of this.parents) {
      parent.childGone();
    }
  }
}

/**
 * A node below `source` that calls `check` in the drain each time `source`
 * emits, and emits nothing itself. A switch (synstate-dom-next's `If`, `For`)
 * decides there which of its branches the update drops and retires them
 * (`retireOwner`), before the drain reaches their nodes: the branches are made
 * in an owner whose depth floor is `branchDepth` (`ownerBelow`), below this
 * node, so none of their nodes computes from a value that rules its branch out.
 *
 * An exception from `check` (a key function of the application's) would end the
 * whole update, so it is held instead and `failed` runs, retiring every branch
 * the check could not keep. The switch's effect drops those branches and throws
 * the exception (`takeFailure`), failing as an effect does; if the update ends
 * before the effect runs, the exception is reported when the update ends.
 */
export class DrainCheck extends DerivedClass<never> {
  readonly #check: () => void;

  readonly #failed: () => void;

  /** What the last check threw; see `takeFailure`. */
  #mut_failure: Failure;

  constructor(
    source: ObservableClass<unknown>,
    check: () => void,
    failed: () => void,
  ) {
    super([source], noValue);

    this.#check = check;

    this.#failed = failed;

    this.#mut_failure = undefined;
  }

  /** What the last check threw, if it threw; taking it clears it. */
  takeFailure(): Failure {
    const failure = this.#mut_failure;

    this.#mut_failure = undefined;

    return failure;
  }

  /** The depth floor of a branch the check decides: one below it. */
  get branchDepth(): number {
    return this.depth + 1;
  }

  /** See `holdUntilUpdateEnds`. */
  reportUnclaimed(): void {
    if (this.#mut_failure === undefined) {
      return;
    }

    console.error(this.#mut_failure.error);

    this.#mut_failure = undefined;
  }

  override recompute(): boolean {
    try {
      this.#check();
    } catch (error) {
      this.#mut_failure = { error };

      holdUntilUpdateEnds(this);

      this.#failed();
    }

    return false;
  }
}

/** One more than the deepest of `parents`. */
export const depthBelow = (
  parents: readonly ObservableClass<unknown>[],
): number => {
  let mut_depth = 0;

  for (const parent of parents) {
    if (parent.depth >= mut_depth) {
      mut_depth = parent.depth + 1;
    }
  }

  return mut_depth;
};

/**
 * The base of every effect: a leaf of the graph that runs after an update has
 * settled. A subclass implements `run`, reading `source.current`.
 */
export abstract class EffectClass<A> implements EffectNode {
  readonly source: ObservableClass<A>;

  // transformer-ignore-next-line convert-to-readonly
  queuedAt: number;

  // transformer-ignore-next-line convert-to-readonly
  disposed: boolean;

  readonly bornAt: number;

  constructor(source: ObservableClass<A>) {
    this.source = source;

    this.queuedAt = 0;

    this.bornAt = writeCount();

    this.disposed = false;

    source.addChild(this);

    adoptIntoCurrentOwner(this);
  }

  /** See `ObservableClass.isEffect`. */
  /* oxlint-disable typescript/class-literal-property-style */
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  get isEffect(): true {
    return true;
  }
  /* oxlint-enable typescript/class-literal-property-style */

  /** An effect is gone once disposed; see `DerivedNode.gone`. */
  get gone(): boolean {
    return this.disposed;
  }

  abstract run(): void;

  /**
   * Stops being run; see `retireOwner`. Disposing an effect runs no code of the
   * application, so this is its disposal.
   */
  retire(): void {
    this.dispose();
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    this.source.childGone();
  }
}

/** `subscribe`: calls `fn` after each update; `subscribe` makes the first call. */
class FnEffect<A> extends EffectClass<A> {
  readonly #fn: (value: A) => void;

  constructor(source: ObservableClass<A>, fn: (value: A) => void) {
    super(source);

    this.#fn = fn;
  }

  run(): void {
    const v = this.source.current;

    if (v === noValue) {
      return;
    }

    // Taken out first, so that it is called with no `this`, as the first call
    // is, not with this effect.
    const fn = this.#fn;

    fn(v);
  }
}

/** Whether `value` is an observable of this copy of the package. */
export const isObservable = (value: unknown): value is Observable<unknown> =>
  value instanceof ObservableClass;

/**
 * The class behind a public observable. Only the observables of this copy of
 * the package are accepted: a graph spanning two copies is not supported, and
 * this is where that is detected.
 */
export const toNode = <A,>(observable: Observable<A>): ObservableClass<A> => {
  if (!(observable instanceof ObservableClass)) {
    throw new TypeError(
      'synstate-next: an observable from another copy of synstate-next was given; a graph cannot span two copies.',
    );
  }

  return observable;
};

/**
 * A node as one of the public types (`Observable`, `InitializedObservable`,
 * `State`, …), which are views of the classes: the one place where a class is
 * given its public type. The caller states which view the node satisfies.
 */
export const view = <V,>(node: ObservableClass<unknown>): V =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as unknown as V;

type EventSink<A> = Readonly<{
  // A method, whose parameter TypeScript checks in both directions: a property
  // would make `ObservableClass` invariant in `A`.
  // eslint-disable-next-line @typescript-eslint/method-signature-style, functional/prefer-property-signatures
  push(value: A): void;
  waiting: boolean;
  drop: () => void;
}>;
