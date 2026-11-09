import * as Arr from 'ts-data-forge/array';
import {
  DerivedClass,
  currentDepthFloor,
  disposeReporting,
  isPending,
  noValue,
  ownerBelow,
  retireOwner,
  toNode,
  view,
  type InitializedObservable,
  type NoValue,
  type Observable,
  type ObservableClass,
  type Owner,
} from '../core/index.mjs';

/**
 * Creates an observable that follows `parents`: an operator written outside the
 * package. `setup` runs once, at creation, and returns its `update` (alone, or
 * with `settled`). The observable holds `initialValue` if given, and nothing
 * until it is first set otherwise. It belongs to the current owner as every
 * observable does. `setup` runs with the observable as the current owner, so
 * what it creates and the cleanups it registers (`ctx.onCleanup`, or
 * `onCleanup`) belong to the observable. Disposing it disposes them as an owner
 * does: the owners `setup` created first, then the cleanups, then the nodes,
 * each newest first.
 *
 * `update` reads its parents. What `setup` creates is for work on the side (a
 * subscription, a listener): a node made there is visited in the same update as
 * this one, not before it, so `update` would read its value from before.
 *
 * An operator that emits later than the update that made it recompute (from a
 * timer) gives `settled`, so that it is not taken for done while a value is
 * still due; a `mergeMap` lets go of an inner observable that is settled.
 *
 * ```ts
 * const double = (source: Observable<number>): Observable<number> =>
 *   createDerived([source], (ctx) => () => {
 *     const v = source.getSnapshot();
 *
 *     if (v !== undefined && ctx.emitted(source)) {
 *       ctx.set(v * 2);
 *     }
 *   });
 * ```
 */
export function createDerived<A>(
  parents: readonly Observable<unknown>[],
  setup: (ctx: DerivedContext<A>) => DerivedBehavior | (() => void),
  options: Readonly<{ initialValue: A }>,
): InitializedObservable<A>;

export function createDerived<A>(
  parents: readonly Observable<unknown>[],
  setup: (ctx: DerivedContext<A>) => DerivedBehavior | (() => void),
): Observable<A>;

export function createDerived<A>(
  parents: readonly Observable<unknown>[],
  setup: (ctx: DerivedContext<A>) => DerivedBehavior | (() => void),
  options?: Readonly<{ initialValue: A }>,
): Observable<A> {
  if (Arr.isEmpty(parents)) {
    throw new RangeError(
      'synstate-next: `createDerived` needs a parent; a source that emits by itself is a `createSource`.',
    );
  }

  return view(
    new CustomDerivedClass(
      parents.map(toNode),
      setup,
      options === undefined ? noValue : options.initialValue,
    ),
  );
}

/** What `createDerived` gives the operator it builds. */
export type DerivedContext<A> = Readonly<{
  /**
   * Whether `parent` emitted in the update under way, after this observable was
   * created. Any of its parents makes it recompute; this tells which of them
   * did.
   */
  emitted: (parent: Observable<unknown>) => boolean;
  /**
   * Passes `value` on in the update under way, once `update` returns; of
   * several, the last. Only for `update`: a value that comes later (from a
   * timer) is `emit`ted.
   */
  set: (value: A) => void;
  /**
   * Passes `value` on in an update of its own, after the one under way if any.
   * Every value given is passed on, in order; nothing once it is disposed.
   */
  emit: (value: A) => void;
  /**
   * Registers `cleanup` to run when the observable is disposed; at once if it
   * is disposed already.
   */
  onCleanup: (cleanup: () => void) => void;
  /** Whether `parent` can emit no more; for `settled`. */
  settled: (parent: Observable<unknown>) => boolean;
}>;

/** What the setup of `createDerived` returns. */
export type DerivedBehavior = Readonly<{
  /** Called in each update a parent emitted in. */
  update: () => void;
  /**
   * Whether it can emit no more, besides being disposed: every parent settled
   * unless given. A value given to `emit` and not passed on yet keeps it from
   * being settled either way.
   */
  settled?: () => boolean;
}>;

class CustomDerivedClass<A> extends DerivedClass<A> {
  /** Undefined until `setup` returns: a write it makes may wake the node. */
  readonly #behavior: DerivedBehavior | undefined;

  /** What `setup` made and registered; disposed with the node. */
  readonly #owner: Owner;

  #mut_updating: boolean;

  /** What `set` gave in the update under way, or `noValue`. */
  #mut_next: A | NoValue;

  constructor(
    parents: readonly ObservableClass<unknown>[],
    setup: (ctx: DerivedContext<A>) => DerivedBehavior | (() => void),
    initial: A | NoValue,
  ) {
    super(parents, initial);

    // Not a child of the current owner: this node disposes it. What it makes is
    // as deep as this node's own floor, so that a switch above retires it in
    // time.
    this.#owner = ownerBelow(undefined, currentDepthFloor());

    this.#mut_updating = false;

    this.#mut_next = noValue;

    this.#behavior = undefined;

    try {
      this.#behavior = this.#owner.run(() => this.#setUp(setup));
    } catch (error) {
      // Nothing of a node that was never returned stays on its parents.
      disposeReporting(this);

      throw error;
    }
  }

  #setUp(
    setup: (ctx: DerivedContext<A>) => DerivedBehavior | (() => void),
  ): DerivedBehavior {
    const behavior = setup({
      emitted: (parent) => this.emittedNow(toNode(parent)),
      set: (value) => {
        if (!this.#mut_updating) {
          throw new Error(
            'synstate-next: `set` is for `update`; a value that comes later is given to `emit`.',
          );
        }

        this.#mut_next = value;
      },
      emit: (value) => {
        if (!this.disposed) {
          this.publishEvent(value);
        }
      },
      onCleanup: (cleanup) => {
        this.#owner.onCleanup(cleanup);
      },
      settled: (parent) => toNode(parent).settled,
    });

    return typeof behavior === 'function' ? { update: behavior } : behavior;
  }

  /** Ends `update`: returns what `set` gave, and holds it no longer. */
  #endUpdate(): A | NoValue {
    const v = this.#mut_next;

    this.#mut_updating = false;

    this.#mut_next = noValue;

    return v;
  }

  override get settled(): boolean {
    const settled = this.#behavior?.settled;

    return settled === undefined
      ? super.settled && !this.eventsWaiting
      : !isPending(this) && !this.eventsWaiting && (this.gone || settled());
  }

  override recompute(): boolean {
    const behavior = this.#behavior;

    if (behavior === undefined) {
      return false;
    }

    this.#mut_updating = true;

    let mut_v: A | NoValue;

    try {
      behavior.update();
    } finally {
      mut_v = this.#endUpdate();
    }

    const v = mut_v;

    // A value `emit`ted before this update (a batch that wrote both) is not
    // overwritten: `v` follows it.
    return v !== noValue && this.passOnInRound(v);
  }

  protected override retireHeld(): void {
    retireOwner(this.#owner);
  }

  protected override teardown(): void {
    try {
      this.#owner.dispose();
    } finally {
      super.teardown();
    }
  }
}
