import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type ObservableClass,
  type Operator,
} from '../core/index.mjs';

/**
 * Drops a value equal to the one held (`Object.is` unless `equals` says
 * otherwise). A derived value is cut off already; this is for an event source,
 * or for a comparison of its own.
 */
export const skipIfNoChange =
  <A,>(equals?: (a: A, b: A) => boolean): Operator<A, A, 'keep'> =>
  (source) =>
    view(new SkipIfNoChangeClass(toNode(source), equals ?? Object.is));

class SkipIfNoChangeClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  readonly #equals: (a: A, b: A) => boolean;

  constructor(parent: ObservableClass<A>, equals: (a: A, b: A) => boolean) {
    super([parent], parent.current);

    this.#parent = parent;

    this.#equals = equals;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue) {
      return false;
    }

    const held = this.current;

    if (held !== noValue && this.#equals(held, v)) {
      return false;
    }

    this.current = v;

    return true;
  }
}
