import type { FixedLengthTuple } from 'ts-type-forge';
import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type DropInitialValueOperator,
  type NoValue,
  type Observable,
  type ObservableClass,
} from '../core/index.mjs';

/**
 * Emits the previous and the current value of the source as a pair, on every
 * value from the second on. The value held at the start counts as the first.
 */
export const pairwise = <A,>(): DropInitialValueOperator<
  A,
  FixedLengthTuple<2, A>
> => toPairs;

const toPairs = <A,>(
  source: Observable<A>,
): Observable<FixedLengthTuple<2, A>> =>
  view(new PairwiseClass(toNode(source)));

class PairwiseClass<A> extends DerivedClass<FixedLengthTuple<2, A>> {
  readonly #parent: ObservableClass<A>;

  #mut_previous: A | NoValue;

  constructor(parent: ObservableClass<A>) {
    super([parent], noValue);

    this.#parent = parent;

    this.#mut_previous = parent.current;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue) {
      return false;
    }

    const previous = this.#mut_previous;

    this.#mut_previous = v;

    if (previous === noValue) {
      return false;
    }

    this.current = [previous, v];

    return true;
  }
}
