import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type DropInitialValueOperator,
  type ObservableClass,
} from '../core/index.mjs';

/**
 * Passes the values of the source while `predicate` holds for them; from the
 * first value it fails for, passes nothing, keeping the last value passed.
 */
export const takeWhile =
  <A,>(predicate: (value: A) => boolean): DropInitialValueOperator<A, A> =>
  (source) =>
    view(new TakeWhileClass(toNode(source), predicate));

/**
 * Drops the values of the source while `predicate` holds for them; from the
 * first value it fails for, passes every value.
 */
export const skipWhile =
  <A,>(predicate: (value: A) => boolean): DropInitialValueOperator<A, A> =>
  (source) =>
    view(new SkipWhileClass(toNode(source), predicate));

class TakeWhileClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  readonly #predicate: (value: A) => boolean;

  constructor(parent: ObservableClass<A>, predicate: (value: A) => boolean) {
    const v = parent.current;

    const passes = v !== noValue && predicate(v);

    super([parent], passes ? v : noValue);

    this.#parent = parent;

    this.#predicate = predicate;

    if (v !== noValue && !passes) {
      this.detach();
    }
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    // Not called once done: the node has detached.
    if (v === noValue) {
      return false;
    }

    if (!this.#predicate(v)) {
      this.detach();

      return false;
    }

    this.current = v;

    return true;
  }
}

class SkipWhileClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  readonly #predicate: (value: A) => boolean;

  #mut_passing: boolean;

  constructor(parent: ObservableClass<A>, predicate: (value: A) => boolean) {
    const v = parent.current;

    const passing = v !== noValue && !predicate(v);

    super([parent], passing ? v : noValue);

    this.#parent = parent;

    this.#predicate = predicate;

    this.#mut_passing = passing;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue) {
      return false;
    }

    if (!this.#mut_passing) {
      if (this.#predicate(v)) {
        return false;
      }

      this.#mut_passing = true;
    }

    this.current = v;

    return true;
  }
}
