/**
 * The run-time classes behind every observable and every effect.
 *
 * A node is created for every derived value of a UI, so its methods live on the
 * prototype and its collections are made when the first entry arrives. The
 * public types (`Observable`, `InitializedObservable`) are views of these
 * classes; `toNode` turns a public observable back into its class.
 */
import { canPublishNow, EventQueue } from './event-queue.mjs';
import { adoptIntoCurrentOwner } from './owner.mjs';
import {
  currentEpoch,
  emit,
  isPending,
  writeCount,
  type DerivedNode,
  type EffectNode,
  type QueuedNode,
} from './scheduler.mjs';
import type { Observable, Operator, Unsubscribe } from './types.mjs';

/** The value of a node that holds none yet. Never seen outside the package. */
export const noValue: unique symbol = Symbol('synstate-next/no-value');

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

  constructor(initial: A | NoValue, depth: number) {
    this.current = initial;

    this.depth = depth;

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

  get hasValue(): boolean {
    return this.current !== noValue;
  }

  peek(): A | undefined {
    const v = this.current;

    return v === noValue ? undefined : v;
  }

  get value(): A {
    const v = this.current;

    if (v === noValue) {
      throw new Error('synstate-next: this observable holds no value yet.');
    }

    return v;
  }

  /**
   * Whether it will never emit again: disposed, or a source that is done (a
   * `timer` that fired, a settled promise). A `mergeMap` lets an inner
   * observable go once it is settled. A state is never settled.
   */
  get settled(): boolean {
    return this.disposed;
  }

  /** Whether anything would be reached by an emission. */
  get hasObserver(): boolean {
    return this.children !== undefined && this.children.length > this.#mut_dead;
  }

  addChild(child: QueuedNode): void {
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

    this.#mut_events?.drop();

    this.teardown();
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

  pipe(
    ...operators: readonly Operator<unknown, unknown>[]
  ): Observable<unknown> {
    let mut_result: Observable<unknown> = view(this);

    for (const operator of operators) {
      mut_result = operator(mut_result);
    }

    return mut_result;
  }

  subscribe(fn: (value: A) => void): Unsubscribe {
    const effect = new FnEffect(this, fn);

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
    if (this.gone) {
      return;
    }

    this.gone = true;

    this.leaveParents();
  }

  /**
   * Settled once it is gone (disposed, or detached for good), or when every
   * parent is, since it emits only when one of them does, and no emission of its
   * own waits for a round.
   */
  override get settled(): boolean {
    return (
      this.gone ||
      (!isPending(this) && this.parents.every((parent) => parent.settled))
    );
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

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    this.source.childGone();
  }
}

/** `subscribe`: calls `fn` with the current value, then after each update. */
class FnEffect<A> extends EffectClass<A> {
  readonly #fn: (value: A) => void;

  constructor(source: ObservableClass<A>, fn: (value: A) => void) {
    super(source);

    this.#fn = fn;

    const v = source.current;

    if (v !== noValue) {
      fn(v);
    }
  }

  run(): void {
    const v = this.source.current;

    if (v !== noValue) {
      this.#fn(v);
    }
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
