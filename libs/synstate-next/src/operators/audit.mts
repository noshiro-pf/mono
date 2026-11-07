import {
  DerivedClass,
  noValue,
  toNode,
  view,
  type NoValue,
  type ObservableClass,
  type Operator,
} from '../core/index.mjs';

/**
 * On a value, waits `milliseconds` and then emits the latest value, in an
 * update of its own; the values in between start no wait of their own. Holds
 * the value the source holds at the start; disposing it drops a value still
 * waiting.
 */
export const audit =
  <A,>(milliseconds: number): Operator<A, A, 'keep'> =>
  (source) =>
    view(new AuditClass(toNode(source), milliseconds));

class AuditClass<A> extends DerivedClass<A> {
  readonly #parent: ObservableClass<A>;

  readonly #milliseconds: number;

  #mut_timer: ReturnType<typeof setTimeout> | undefined;

  #mut_latest: A | NoValue;

  constructor(parent: ObservableClass<A>, milliseconds: number) {
    super([parent], parent.current);

    this.#parent = parent;

    this.#milliseconds = milliseconds;

    this.#mut_timer = undefined;

    this.#mut_latest = noValue;
  }

  override get settled(): boolean {
    return super.settled && this.#mut_timer === undefined;
  }

  override recompute(): boolean {
    const v = this.#parent.current;

    if (v === noValue) {
      return false;
    }

    this.#mut_latest = v;

    if (this.#mut_timer === undefined) {
      this.#mut_timer = setTimeout(() => {
        this.#mut_timer = undefined;

        const latest = this.#mut_latest;

        this.#mut_latest = noValue;

        if (latest !== noValue) {
          this.publish(latest);
        }
      }, this.#milliseconds);
    }

    return false;
  }

  protected override teardown(): void {
    clearTimeout(this.#mut_timer);

    this.#mut_timer = undefined;

    this.#mut_latest = noValue;

    super.teardown();
  }
}
