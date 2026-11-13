import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type DropInitialValueOperator,
  type ObservableClass,
} from '../core/index.mjs';

/**
 * Holds no value when created, whatever the source holds, and passes on every
 * value the source emits after that. Unlike `skip(1)`, which drops the first
 * emission of a source that holds no value, it drops only a value held at the
 * start.
 */
export const dropInitialValue =
  <A,>(): DropInitialValueOperator<A, A> =>
  (source) =>
    view(new DropInitialValueClass<A>(toNode(source)));

class DropInitialValueClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  constructor(parent: ObservableClass<A>) {
    super([parent], noValue);

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
