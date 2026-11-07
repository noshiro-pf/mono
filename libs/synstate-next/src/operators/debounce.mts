import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type ObservableClass,
  type Operator,
} from '../core/index.mjs';

/**
 * Emits the latest value once `milliseconds` have passed without another, in an
 * update of its own. Holds no value until then; disposing it drops a value
 * still waiting.
 */
export const debounce =
  <A,>(milliseconds: number): Operator<A, A, 'drop'> =>
  (source) =>
    view(new DebounceClass(toNode(source), milliseconds));

class DebounceClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  readonly #milliseconds: number;

  #mut_timer: ReturnType<typeof setTimeout> | undefined;

  constructor(parent: ObservableClass<A>, milliseconds: number) {
    super([parent], noValue);

    this.#parent = parent;

    this.#milliseconds = milliseconds;

    this.#mut_timer = undefined;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue) {
      return false;
    }

    if (this.#mut_timer !== undefined) {
      clearTimeout(this.#mut_timer);
    }

    this.#mut_timer = setTimeout(() => {
      this.#mut_timer = undefined;

      this.publish(v);
    }, this.#milliseconds);

    return false;
  }

  protected override teardown(): void {
    if (this.#mut_timer !== undefined) {
      clearTimeout(this.#mut_timer);

      this.#mut_timer = undefined;
    }

    super.teardown();
  }
}
