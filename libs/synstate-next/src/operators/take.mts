import {
  DerivedClass,
  assertCount,
  noValue,
  toNode,
  view,
  type ObservableClass,
  type Operator,
} from '../core/index.mjs';

/**
 * Passes the first `count` values of the source, the one it holds at the start
 * included, and then nothing, keeping the last value passed. `count` is a
 * positive integer.
 */
export const take = <A,>(count: number): Operator<A, A, 'keep'> => {
  assertCount(count, 1);

  return (source) => view(new TakeClass(toNode(source), count));
};

/**
 * Drops the first `count` values of the source, the one it holds at the start
 * included, and passes the rest. `count` is a non-negative integer.
 */
export const skip = <A,>(count: number): Operator<A, A, 'drop'> => {
  assertCount(count, 0);

  return (source) => view(new SkipClass(toNode(source), count));
};

class TakeClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  /** How many more values pass. */
  #mut_left: number;

  constructor(parent: ObservableClass<A>, count: number) {
    const v = parent.current;

    super([parent], v);

    this.#parent = parent;

    this.#mut_left = v === noValue ? count : count - 1;

    if (this.#mut_left === 0) {
      this.detach();
    }
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    // Not called once `#mut_left` is 0: the node has detached.
    if (v === noValue) {
      return false;
    }

    this.#mut_left -= 1;

    if (this.#mut_left === 0) {
      this.detach();
    }

    this.current = v;

    return true;
  }
}

class SkipClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  /** How many more values are dropped. */
  #mut_left: number;

  constructor(parent: ObservableClass<A>, count: number) {
    const v = parent.current;

    const passes = v !== noValue && count === 0;

    super([parent], passes ? v : noValue);

    this.#parent = parent;

    this.#mut_left = v === noValue || count === 0 ? count : count - 1;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue) {
      return false;
    }

    if (this.#mut_left > 0) {
      this.#mut_left -= 1;

      return false;
    }

    this.current = v;

    return true;
  }
}
