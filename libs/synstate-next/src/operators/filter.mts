import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type ObservableClass,
  type Operator,
} from '../core/index.mjs';

/** Passes on the values that satisfy `predicate`. */
export const filter =
  <A,>(predicate: (value: A) => boolean): Operator<A, A, 'drop'> =>
  (source) =>
    view(new FilterClass(toNode(source), predicate));

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
