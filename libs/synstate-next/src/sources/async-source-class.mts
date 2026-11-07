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

  /** Settled once done and its last value no longer waits to be delivered. */
  override get settled(): boolean {
    return (
      this.disposed ||
      (this.#mut_done && !this.eventsWaiting && !isPending(this))
    );
  }

  /**
   * Emits `value` unless disposed, as an event (see `publishEvent`); `last`
   * settles it. A value given while the graph drains (another library's
   * callback run by a `map`) waits for the drain to end, as a write does.
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
