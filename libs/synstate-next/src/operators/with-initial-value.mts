import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type ObservableClass,
  type Operator,
} from '../core/index.mjs';

/** Holds `initial` until the source emits, then follows the source. */
export const withInitialValue =
  <A, I = A>(initial: I): Operator<A, A | I, 'provide'> =>
  (source) =>
    view(new WithInitialValueClass<A, I>(toNode(source), initial));

class WithInitialValueClass<A, I> extends DerivedClass<A | I> {
  readonly #parent: ObservableClass<A>;

  constructor(parent: ObservableClass<A>, initial: I) {
    const v = parent.current;

    super([parent], v === noValue ? initial : v);

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
