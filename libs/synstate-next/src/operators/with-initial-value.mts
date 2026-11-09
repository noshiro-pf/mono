import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type ObservableClass,
  type ProvideInitialValueOperator,
} from '../core/index.mjs';

/** Holds `initialValue` until the source emits, then follows the source. */
export const withInitialValue =
  <A, I = A>(initialValue: I): ProvideInitialValueOperator<A, A | I> =>
  (source) =>
    view(new WithInitialValueClass<A, I>(toNode(source), initialValue));

class WithInitialValueClass<A, I> extends DerivedClass<A | I> {
  readonly #parent: ObservableClass<A>;

  constructor(parent: ObservableClass<A>, initialValue: I) {
    const v = parent.current;

    super([parent], v === noValue ? initialValue : v);

    this.#parent = parent;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue) {
      return false;
    }

    this.current = v;

    return true;
  }
}
