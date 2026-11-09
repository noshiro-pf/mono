import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type KeepInitialValueOperator,
  type ObservableClass,
} from '../core/index.mjs';

/**
 * Maps each value with `fn`, and emits the result unless it equals the one held
 * (`Object.is` unless `equals` says otherwise), so a result that did not change
 * makes nothing below recompute. For an event mapped to a value that repeats,
 * pass `equals: () => false`.
 */
export const map =
  <A, B>(
    fn: (value: A) => B,
    options?: Readonly<{ equals?: (current: B, next: B) => boolean }>,
  ): KeepInitialValueOperator<A, B> =>
  (source) =>
    view(new MapClass(toNode(source), fn, options?.equals ?? Object.is));

class MapClass<A, B> extends DerivedClass<B> {
  readonly #parent: ObservableClass<A>;

  readonly #fn: (value: A) => B;

  readonly #equals: (current: B, next: B) => boolean;

  constructor(
    parent: ObservableClass<A>,
    fn: (value: A) => B,
    equals: (current: B, next: B) => boolean,
  ) {
    const v = parent.current;

    super([parent], v === noValue ? noValue : fn(v));

    this.#parent = parent;

    this.#fn = fn;

    this.#equals = equals;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue) {
      return false;
    }

    const next = this.#fn(v);

    const held = this.current;

    if (held !== noValue && this.#equals(held, next)) {
      return false;
    }

    this.current = next;

    return true;
  }
}
