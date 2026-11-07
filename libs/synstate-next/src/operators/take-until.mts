import {
  DerivedClass,
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
    view(new SkipUntilClass(toNode(source), toNode(notifier)));

class TakeUntilClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  readonly #notifier: ObservableClass<unknown>;

  constructor(parent: ObservableClass<A>, notifier: ObservableClass<unknown>) {
    super([parent, notifier], parent.current);

    this.#parent = parent;

    this.#notifier = notifier;
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

  readonly #notifier: ObservableClass<unknown>;

  #mut_passing: boolean;

  constructor(parent: ObservableClass<A>, notifier: ObservableClass<unknown>) {
    super([parent, notifier], noValue);

    this.#parent = parent;

    this.#notifier = notifier;

    this.#mut_passing = false;
  }

  override recompute(): boolean {
    if (this.emittedNow(this.#notifier)) {
      this.#mut_passing = true;
    }

    const v = this.#parent.current;

    if (v === noValue || !this.#mut_passing || !this.emittedNow(this.#parent)) {
      return false;
    }

    this.current = v;

    return true;
  }
}
