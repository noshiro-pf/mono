import { replaceEqualDeep, type ReplaceEqualDeepOptions } from 'ts-data-forge';
import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type KeepInitialValueOperator,
  type ObservableClass,
} from '../core/index.mjs';

/**
 * Replaces the parts of each value that are deeply equal to the held value's
 * with the held value's own, so that a part that did not change keeps its
 * reference. A value deeply equal to the one held emits nothing.
 */
export const keepEqualParts =
  <A,>(options?: ReplaceEqualDeepOptions): KeepInitialValueOperator<A, A> =>
  (source) =>
    view(new KeepEqualPartsClass(toNode(source), options));

class KeepEqualPartsClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  readonly #options: ReplaceEqualDeepOptions | undefined;

  constructor(
    parent: ObservableClass<A>,
    options: ReplaceEqualDeepOptions | undefined,
  ) {
    super([parent], parent.current);

    this.#parent = parent;

    this.#options = options;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue) {
      return false;
    }

    const held = this.current;

    if (held === noValue) {
      this.current = v;

      return true;
    }

    const kept = replaceEqualDeep(held, v, this.#options);

    if (Object.is(kept, held)) {
      return false;
    }

    this.current = kept;

    return true;
  }
}
