import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type DropInitialValueOperator,
  type ObservableClass,
} from '../core/index.mjs';

/**
 * Passes on the values that satisfy `predicate`. A type guard narrows the
 * values passed on.
 */
export function filter<A, B extends A>(
  predicate: (value: A) => value is B,
): DropInitialValueOperator<A, B>;

// A type guard and a boolean predicate are the same function at run time, so
// the first signature only narrows the result. One signature with a union
// parameter would infer `unknown` for a generic guard such as `isNotUndefined`.
export function filter<A>(
  predicate: (value: A) => boolean,
): DropInitialValueOperator<A, A>;

export function filter<A>(
  predicate: (value: A) => boolean,
): DropInitialValueOperator<A, A> {
  return (source) => view(new FilterClass(toNode(source), predicate));
}

class FilterClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  readonly #predicate: (value: A) => boolean;

  constructor(parent: ObservableClass<A>, predicate: (value: A) => boolean) {
    const v = parent.current;

    super([parent], v !== noValue && predicate(v) ? v : noValue);

    this.#parent = parent;

    this.#predicate = predicate;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue || !this.#predicate(v)) {
      return false;
    }

    this.current = v;

    return true;
  }
}
