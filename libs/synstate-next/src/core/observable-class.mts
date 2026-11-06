/**
 * The run-time classes behind every observable and every effect.
 *
 * A node is created for every derived value of a UI, so its methods live on the
 * prototype and its collections are made when the first entry arrives. The
 * public types (`Observable`, `InitializedObservable`) are views of these
 * classes; `toNode` turns a public observable back into its class.
 */
import { adoptIntoCurrentOwner } from './owner.mjs';
import {
  emit,
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

  // transformer-ignore-next-line convert-to-readonly
  disposed: boolean;

  constructor(initial: A | NoValue, depth: number) {
    this.current = initial;

    this.depth = depth;

    this.children = undefined;

    this.queuedAt = 0;

    this.changedAt = 0;

    this.disposed = false;

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
   * Called by a child that was disposed. The child stays in `children` until
   * half of them are gone; the queue skips disposed entries meanwhile.
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
      if (child.disposed) {
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

    this.teardown();
  }

  /** Releases what the node holds: its parents, timers, inner nodes. */
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
 */
export class DerivedClass<A> extends ObservableClass<A> {
  readonly parents: readonly ObservableClass<unknown>[];

  constructor(
    parents: readonly ObservableClass<unknown>[],
    initial: A | NoValue,
  ) {
    super(initial, depthBelow(parents));

    this.parents = parents;

    for (const parent of parents) {
      parent.addChild(this);
    }
  }

  protected override teardown(): void {
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

  constructor(source: ObservableClass<A>) {
    this.source = source;

    this.queuedAt = 0;

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
