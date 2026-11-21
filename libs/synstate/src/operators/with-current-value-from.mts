import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type DropInitialValueOperator,
  type Observable,
  type ObservableClass,
} from '../core/index.mjs';

/**
 * Pairs each value of the source with the value `other` holds, up to date for
 * the same update. A change of `other` alone does not make it recompute, so it
 * emits nothing. Emits nothing while `other` holds no value.
 */
export const withCurrentValueFrom =
  <A, B>(other: Observable<B>): DropInitialValueOperator<A, readonly [A, B]> =>
  (source) =>
    view(new WithCurrentValueFromClass(toNode(source), toNode(other)));

class WithCurrentValueFromClass<A, B> extends DerivedClass<readonly [A, B]> {
  readonly #parent: ObservableClass<A>;

  readonly #other: ObservableClass<B>;

  constructor(parent: ObservableClass<A>, other: ObservableClass<B>) {
    const v = parent.current;

    const o = other.current;

    super([parent], v === noValue || o === noValue ? noValue : [v, o], [other]);

    this.#parent = parent;

    this.#other = other;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    const o = this.#other.current;

    if (v === noValue || o === noValue) {
      return false;
    }

    this.current = [v, o];

    return true;
  }
}
