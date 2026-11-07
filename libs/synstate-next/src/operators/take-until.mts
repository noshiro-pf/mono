import {
  DerivedClass,
  isPending,
  noValue,
  toNode,
  view,
  type Observable,
  type ObservableClass,
  type Operator,
} from '../core/index.mjs';

/**
 * Follows the source until `notifier` emits, then passes nothing, keeping the
 * last value passed. A value the source emits in the update the notifier emits
 * in does not pass. A value the notifier holds at the start is not an emission.
 */
export const takeUntil =
  <A,>(notifier: Observable<unknown>): Operator<A, A, 'keep'> =>
  (source) =>
    view(new TakeUntilClass(toNode(source), toNode(notifier)));

/**
 * Passes nothing until `notifier` emits, then every value of the source, the
 * one it emits in the update the notifier emits in included. A value the
 * notifier holds at the start is not an emission.
 */
export const skipUntil =
  <A,>(notifier: Observable<unknown>): Operator<A, A, 'drop'> =>
  (source) =>
    view(
      new SkipUntilClass(toNode(source), new FirstEmission(toNode(notifier))),
    );

class TakeUntilClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  readonly #emitters: readonly [ObservableClass<A>];

  readonly #notifier: ObservableClass<unknown>;

  constructor(parent: ObservableClass<A>, notifier: ObservableClass<unknown>) {
    super([parent, notifier], parent.current);

    this.#parent = parent;

    this.#notifier = notifier;

    this.#emitters = [parent];
  }

  /** The notifier only ends it. */
  protected override get emitters(): readonly ObservableClass<unknown>[] {
    return this.#emitters;
  }

  override recompute(): boolean {
    // Not called once done: the node has detached.
    if (this.emittedNow(this.#notifier)) {
      this.detach();

      return false;
    }

    const v = this.#parent.current;

    if (v === noValue || !this.emittedNow(this.#parent)) {
      return false;
    }

    this.current = v;

    return true;
  }
}

class SkipUntilClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  readonly #emitters: readonly [ObservableClass<A>];

  readonly #notifier: FirstEmission;

  constructor(parent: ObservableClass<A>, notifier: FirstEmission) {
    super([parent, notifier], noValue);

    this.#parent = parent;

    this.#notifier = notifier;

    this.#emitters = [parent];
  }

  /** Settled also once the notifier is without having emitted. */
  override get settled(): boolean {
    return (
      super.settled ||
      (!isPending(this) && !this.#notifier.emitted && this.#notifier.settled)
    );
  }

  /** The notifier only lets values through. */
  protected override get emitters(): readonly ObservableClass<unknown>[] {
    return this.#emitters;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (
      v === noValue ||
      !this.#notifier.emitted ||
      !this.emittedNow(this.#parent)
    ) {
      return false;
    }

    this.current = v;

    return true;
  }

  protected override teardown(): void {
    this.#notifier.dispose();
  }
}

/**
 * Emits once, when the notifier emits for the first time after it was created,
 * and leaves it in that update: `skipUntil` follows this node, so that it stops
 * observing the notifier once it passes values.
 */
class FirstEmission extends DerivedClass<undefined> {
  readonly #notifier: ObservableClass<unknown>;

  constructor(notifier: ObservableClass<unknown>) {
    super([notifier], noValue);

    this.#notifier = notifier;
  }

  /** Whether the notifier has emitted; the value of this node, held. */
  get emitted(): boolean {
    return this.current !== noValue;
  }

  override recompute(): boolean {
    // Not called once done: the node has detached.
    if (!this.emittedNow(this.#notifier)) {
      return false;
    }

    this.detach();

    this.current = undefined;

    return true;
  }
}
