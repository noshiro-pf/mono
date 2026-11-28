import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type KeepInitialValueOperator,
  type ObservableClass,
} from '../core/index.mjs';

/**
 * Passes a value at once, then drops the values of the next `milliseconds`.
 * Holds the value the source holds at the start, without opening a window.
 */
export const throttle =
  <A,>(milliseconds: number): KeepInitialValueOperator<A, A> =>
  (source) =>
    view(new ThrottleClass(toNode(source), milliseconds));

class ThrottleClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  readonly #milliseconds: number;

  #mut_timer: ReturnType<typeof setTimeout> | undefined;

  constructor(parent: ObservableClass<A>, milliseconds: number) {
    super([parent], parent.current);

    this.#parent = parent;

    this.#milliseconds = milliseconds;

    this.#mut_timer = undefined;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue || this.#mut_timer !== undefined) {
      return false;
    }

    this.#mut_timer = setTimeout(() => {
      this.#mut_timer = undefined;
    }, this.#milliseconds);

    this.current = v;

    return true;
  }

  protected override teardown(): void {
    clearTimeout(this.#mut_timer);

    this.#mut_timer = undefined;

    super.teardown();
  }
}
