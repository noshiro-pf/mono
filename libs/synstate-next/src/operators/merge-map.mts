import {
  DerivedClass,
  InnerFollower,
  awaitsEffects,
  currentDepthFloor,
  deferWrite,
  disposeAll,
  disposeReporting,
  isPropagating,
  noValue,
  ownerBelow,
  retireOwner,
  toNode,
  view,
  type DropInitialValueOperator,
  type Observable,
  type ObservableClass,
  type Owner,
} from '../core/index.mjs';

/**
 * Follows every observable that `project` returns, emitting whatever any of
 * them emits. What a projection creates belongs to an owner of its own,
 * disposed once its observable is settled (a `timer` that fired, a settled
 * promise) or when this node is disposed.
 *
 * The inner observable's value at the time of the projection joins the update
 * that caused it, unless this node already emitted in that update. A later
 * emission arrives in an update of its own. Every value is delivered, as an
 * event source's are: values that meet in one update are delivered one update
 * after another, in the order they arrived.
 */
export const mergeMap =
  <A, B>(
    project: (value: A) => Observable<B>,
  ): DropInitialValueOperator<A, B> =>
  (source) =>
    view(new MergeMapClass(toNode(source), project));

/**
 * Whether `inner` can give its `mergeMap` nothing more: settled, and not waiting
 * for its follower to read what it emitted in the round under way.
 */
const isDone = (inner: ObservableClass<unknown>): boolean =>
  inner.settled && !awaitsEffects(inner);

/** The fewest inner observables at which `MergeMapClass` sweeps. */
const minSweepSize = 8;

class MergeMapClass<A, B> extends DerivedClass<B> {
  readonly #parent: ObservableClass<A>;

  readonly #project: (value: A) => Observable<B>;

  /** The depth floor this node was made at, for the nodes of its projections. */
  readonly #depthFloor: number;

  /** The inner observables still followed, by their owners. */
  // transformer-ignore-next-line convert-to-readonly
  readonly #inners: Map<Owner, ObservableClass<B>>;

  /**
   * The number of inner observables at which the next projection sweeps away
   * those that settled without emitting (a `fromSubscribable` that completed
   * empty), which nothing else reports. Doubled after each sweep, so a sweep
   * costs O(1) per projection.
   */
  #mut_sweepAt: number;

  constructor(
    parent: ObservableClass<A>,
    project: (value: A) => Observable<B>,
  ) {
    super([parent], noValue);

    this.#parent = parent;

    this.#project = project;

    this.#depthFloor = currentDepthFloor();

    this.#inners = new Map<Owner, ObservableClass<B>>();

    this.#mut_sweepAt = minSweepSize;

    const v = parent.current;

    if (v !== noValue) {
      try {
        this.#add(v);
      } catch (error) {
        // Nothing of a node that was never returned stays on its parent.
        disposeReporting(this);

        throw error;
      }
    }
  }

  /**
   * Follows the projection of `value`; returns whether the value changed. A
   * projection that throws has what it made disposed at once.
   */
  #add(value: A): boolean {
    // Not a child of the current owner: this node disposes it. Its nodes are as
    // deep as this node's own floor, so that a switch above retires them in
    // time.
    const owner = ownerBelow(undefined, this.#depthFloor);

    const inner = this.#follow(owner, value);

    // Disposed by its projection (which disposed an owner of it): its teardown
    // has run, so what this projection made is let go here.
    if (this.disposed) {
      disposeReporting(owner);

      return false;
    }

    this.#inners.set(owner, inner);

    const v = inner.current;

    // A settled inner made by this projection emitted nothing its follower saw.
    if (inner.settled) {
      this.#release(owner);
    } else if (this.#inners.size >= this.#mut_sweepAt) {
      // Once the round has reached every effect: an inner settled in the drain
      // may still carry its last value to its follower.
      if (isPropagating()) {
        deferWrite(() => {
          this.#sweep();
        });
      } else {
        this.#sweep();
      }
    }

    // An inner's value from the last round's effects, not yet seen by this
    // round's, is not overwritten: `v` follows it.
    return v !== noValue && this.passOnInRound(v);
  }

  /** Runs the projection of `value` in `owner`, which is disposed if it throws. */
  #follow(owner: Owner, value: A): ObservableClass<B> {
    try {
      return owner.run(() => {
        const node = toNode(this.#project(value));

        // The constructor makes it the inner's child and gives it to `owner`.
        // oxlint-disable-next-line eslint/no-new
        new InnerFollower(node, this, owner);

        return node;
      });
    } catch (error) {
      disposeReporting(owner);

      throw error;
    }
  }

  /** Releases the inner observables that are done; see `#mut_sweepAt`. */
  #sweep(): void {
    for (const [owner, inner] of this.#inners) {
      if (isDone(inner)) {
        this.#release(owner);
      }
    }

    this.#mut_sweepAt = Math.max(minSweepSize, this.#inners.size * 2);
  }

  /** Lets an inner go; what its disposal throws is reported, see `disposeReporting`. */
  #release(owner: Owner): void {
    this.#inners.delete(owner);

    disposeReporting(owner);
  }

  override get settled(): boolean {
    if (!super.settled || this.eventsWaiting) {
      return false;
    }

    // Returns at the first inner still live; the settled ones before it are
    // bounded by the sweep.
    for (const inner of this.#inners.values()) {
      if (!isDone(inner)) {
        return false;
      }
    }

    return true;
  }

  /** Called by a follower when its inner observable emits later. */
  innerEmitted(value: B, owner: Owner): void {
    // The follower has read the value: settled is enough.
    if (this.#inners.get(owner)?.settled === true) {
      this.#release(owner);
    }

    this.publishEvent(value);
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    return v !== noValue && this.#add(v);
  }

  protected override retireHeld(): void {
    for (const owner of this.#inners.keys()) {
      retireOwner(owner);
    }
  }

  protected override teardown(): void {
    const owners = Array.from(this.#inners.keys());

    this.#inners.clear();

    // Newest first, as an owner disposes its children; all of them even when
    // one throws.
    disposeAll(owners);

    super.teardown();
  }
}
