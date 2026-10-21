import { Optional, Result } from 'ts-data-forge';
import { RootObservableClass } from '../class/index.mjs';
import { type FromPromiseObservable } from '../types/index.mjs';

/**
 * Creates an observable from a Promise factory that receives an `AbortSignal`.
 * When the observable is completed (e.g., by `switchMap` switching to a new
 * inner observable), the `AbortController` is automatically aborted, cancelling
 * the in-flight request.
 *
 * Emits `Result.ok(value)` when the promise resolves, or `Result.err(error)`
 * when it rejects. Rejections caused by abort (`AbortError`) are silently
 * ignored and do not emit.
 *
 * @template A - The type of the resolved value
 * @template E - The type of the error (excluding AbortError)
 * @param factory - A function that receives an `AbortSignal` and returns a Promise
 * @returns An observable that emits the promise result
 *
 * @example
 * ```ts
 * const results$ = query.pipe(
 *   switchMap((q) =>
 *     fromAbortablePromise((signal) =>
 *       fetch(`/api/search?q=${q}`, { signal }).then((r) => r.json()),
 *     ),
 *   ),
 * );
 * ```
 */
export const fromAbortablePromise = <A, E = unknown>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  factory: (signal: AbortSignal) => Promise<A>,
): FromPromiseObservable<A, E> =>
  new FromAbortablePromiseObservableClass(factory);

class FromAbortablePromiseObservableClass<A, E = unknown>
  extends RootObservableClass<Result<A, E>>
  implements FromPromiseObservable<A, E>
{
  readonly #abortController: AbortController;

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  constructor(factory: (signal: AbortSignal) => Promise<A>) {
    super({ initialValue: Optional.none });

    this.#abortController = new AbortController();

    const promise = factory(this.#abortController.signal);

    promise
      .then((value) => {
        if (this.isCompleted) return;

        this.startUpdate(Result.ok(value));
      })
      .catch((error: unknown) => {
        if (this.isCompleted) return;

        // Silently ignore AbortError — it means the observable was
        // intentionally completed (e.g., by switchMap).
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        this.startUpdate(
          Result.err(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            error as E,
          ),
        );
      })
      .finally(() => {
        this.complete();
      });
  }

  override complete(): void {
    this.#abortController.abort();

    super.complete();
  }
}
