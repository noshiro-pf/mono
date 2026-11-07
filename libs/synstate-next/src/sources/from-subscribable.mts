import { Result } from 'ts-std-forge';
import { noValue, view, type Observable } from '../core/index.mjs';
import { AsyncSourceClass } from './async-source-class.mjs';

/**
 * What `fromSubscribable` takes: anything subscribed to with an observer
 * object, as an RxJS observable or a TC39 `Observable` is.
 */
export type Subscribable<A> = Readonly<{
  subscribe: (
    observer: Readonly<{
      next: (value: A) => void;
      error: (error: unknown) => void;
      complete: () => void;
    }>,
  ) => Readonly<{ unsubscribe: () => void }>;
}>;

/**
 * Follows `subscribable`, emitting each of its values as `Result.ok(value)` and
 * an error as `Result.err(error)`. It settles on the error or on completion,
 * and unsubscribes when disposed. A value given while it subscribes is held
 * from the start rather than emitted.
 */
export const fromSubscribable = <A, E = unknown>(
  subscribable: Subscribable<A>,
): Observable<Result<A, E>> =>
  view(new FromSubscribableClass<A, E>(subscribable));

class FromSubscribableClass<A, E> extends AsyncSourceClass<Result<A, E>> {
  #mut_subscription: Readonly<{ unsubscribe: () => void }> | undefined;

  /** Set while `subscribe` runs: a value then is held, not emitted. */
  readonly #subscribing: boolean;

  constructor(subscribable: Subscribable<A>) {
    super(noValue);

    this.#mut_subscription = undefined;

    this.#subscribing = true;

    const subscription = subscribable.subscribe({
      next: (value) => {
        this.#receive(Result.ok(value), false);
      },
      error: (error) => {
        // The type of an error is the caller's to state.
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        this.#receive(Result.err(error as E), true);
      },
      complete: () => {
        this.finish();
      },
    });

    this.#subscribing = false;

    if (this.disposed) {
      subscription.unsubscribe();
    } else {
      this.#mut_subscription = subscription;
    }
  }

  #receive(value: Result<A, E>, last: boolean): void {
    if (!this.#subscribing) {
      this.deliver(value, last);

      return;
    }

    // Created in a drain or a batch, an emission now would start an update
    // inside it: the value is the one it starts with.
    this.current = value;

    if (last) {
      this.finish();
    }
  }

  protected override teardown(): void {
    this.#mut_subscription?.unsubscribe();

    this.#mut_subscription = undefined;
  }
}
