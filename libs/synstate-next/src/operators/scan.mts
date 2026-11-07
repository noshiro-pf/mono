import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type ObservableClass,
  type Operator,
} from '../core/index.mjs';

/**
 * Accumulates the values with `reducer`, starting from `seed`. Holds `seed` (or
 * the first value folded into it) from the start, and emits on every value of
 * the source.
 */
export const scan =
  <A, B>(reducer: (acc: B, value: A) => B, seed: B): Operator<A, B, 'with'> =>
  (source) =>
    view(new ScanClass(toNode(source), reducer, seed));

class ScanClass<A, B> extends DerivedClass<B> {
  readonly #parent: ObservableClass<A>;

  readonly #reducer: (acc: B, value: A) => B;

  /** The accumulator; the same as `current`, typed without `noValue`. */
  #mut_acc: B;

  constructor(
    parent: ObservableClass<A>,
    reducer: (acc: B, value: A) => B,
    seed: B,
  ) {
    const v = parent.current;

    const first = v === noValue ? seed : reducer(seed, v);

    super([parent], first);

    this.#mut_acc = first;

    this.#parent = parent;

    this.#reducer = reducer;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue) {
      return false;
    }

    this.#mut_acc = this.#reducer(this.#mut_acc, v);

    this.current = this.#mut_acc;

    return true;
  }
}
