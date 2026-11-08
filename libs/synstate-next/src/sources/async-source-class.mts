import { ObservableClass, isPending, type NoValue } from '../core/index.mjs';

/**
 * The base of the sources that emit by themselves, from a timer, a promise or
 * another library: an emission is an update of its own, and the source settles
 * once it can emit no more.
 */
export class AsyncSourceClass<A> extends ObservableClass<A> {
  #mut_done: boolean;

  constructor(initial: A | NoValue) {
    super(initial, 0);

    this.#mut_done = false;
  }

  /** Whether it can emit no more: its last value or its end was given. */
  protected get done(): boolean {
    return this.#mut_done;
  }

  /**
   * Settled once disposed or done, and no value of it waits to be delivered.
   */
  override get settled(): boolean {
    return (
      !isPending(this) &&
      (this.disposed || (this.#mut_done && !this.eventsWaiting))
    );
  }

  /**
   * Emits `value` unless disposed, as an event (see `publishEvent`); `last`
   * settles it. A value given while the graph drains (another library's
   * callback run by a `map`) waits until the round's effects have run, as a
   * write does.
   */
  protected deliver(value: A, last: boolean): void {
    if (this.disposed) {
      return;
    }

    if (last) {
      this.#mut_done = true;
    }

    this.publishEvent(value);
  }

  /** Settles it without a value. */
  protected finish(): void {
    this.#mut_done = true;
  }
}
