import { Result } from 'ts-std-forge';
import {
  noValue,
  rethrowOutOfPromise,
  view,
  type Observable,
} from '../core/index.mjs';
import { AsyncSourceClass } from './async-source-class.mjs';

/**
 * Emits the outcome of `promise` once, as `Result.ok(value)` or
 * `Result.err(error)`, in an update of its own, and settles.
 */
export const fromPromise = <A, E = unknown>(
  promise: Promise<A>,
): Observable<Result<A, E>> => view(new FromPromiseClass<A, E>(promise));

/**
 * Calls `factory` with an `AbortSignal` and emits the outcome of the promise it
 * returns, as `fromPromise` does. Disposing it (a `switchMap` moving on, an
 * owner disposed) aborts the signal, whether or not the promise has settled, so
 * read a response body inside `factory`: one read after it may be cut off. A
 * rejection that follows emits nothing.
 */
export const fromAbortablePromise = <A, E = unknown>(
  factory: (signal: AbortSignal) => Promise<A>,
): Observable<Result<A, E>> =>
  view(new FromAbortablePromiseClass<A, E>(factory));

class FromPromiseClass<A, E> extends AsyncSourceClass<Result<A, E>> {
  constructor(promise: Promise<A>) {
    super(noValue);

    // `onRejected` beside `onFulfilled`, so that only the promise's own
    // rejection becomes an `err`: what a subscriber throws on the `ok` value is
    // not the promise's, and goes to `rethrowOutOfPromise`.
    promise
      // eslint-disable-next-line unicorn/prefer-then-catch, ts-restrictions/prefer-catch -- its suggestion would take what a subscriber throws for the promise's rejection
      .then(
        (value) => {
          this.deliver(Result.ok(value), true);
        },
        (error: unknown) => {
          // The type of a rejection is the caller's to state.
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          this.deliver(Result.err(error as E), true);
        },
      )
      .catch(rethrowOutOfPromise);
  }
}

class FromAbortablePromiseClass<A, E> extends AsyncSourceClass<Result<A, E>> {
  readonly #controller: AbortController;

  constructor(factory: (signal: AbortSignal) => Promise<A>) {
    super(noValue);

    const controller = new AbortController();

    this.#controller = controller;

    // A `factory` that throws becomes a rejection, so that it emits an `err` as
    // the promise's own rejection would.
    const request = startRequest(factory, controller.signal);

    // See `FromPromiseClass`.
    request
      // eslint-disable-next-line unicorn/prefer-then-catch, ts-restrictions/prefer-catch -- see `FromPromiseClass`
      .then(
        (value) => {
          this.deliver(Result.ok(value), true);
        },
        (error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }

          // The type of a rejection is the caller's to state.
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          this.deliver(Result.err(error as E), true);
        },
      )
      .catch(rethrowOutOfPromise);
  }

  protected override teardown(): void {
    this.#controller.abort();
  }
}

const startRequest = <A,>(
  factory: (signal: AbortSignal) => Promise<A>,
  abortSignal: AbortSignal,
): Promise<A> => {
  try {
    return factory(abortSignal);
  } catch (error: unknown) {
    // What the factory threw, passed on unchanged.
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    return Promise.reject(error);
  }
};
