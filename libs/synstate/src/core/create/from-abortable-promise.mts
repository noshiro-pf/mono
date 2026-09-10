import { Optional, Result } from 'ts-data-forge';
import { createRootObservable } from '../base/index.mjs';
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
 * //  Timeline:
 * //
 * //  query$      "a"            "b"
 * //  request a   [in flight]    | (aborted)
 * //  request b                  [in flight]  -> "result for b"
 * //  results$                                  Ok("result for b")
 * //
 * //  Explanation:
 * //  - fromAbortablePromise hands its factory an AbortSignal
 * //  - switchMap completes the previous inner observable, which aborts it
 * //  - The AbortError that follows is swallowed, so nothing is emitted for it
 *
 * const search = (query: string, signal: AbortSignal): Promise<string> =>
 *   new Promise((resolve, reject) => {
 *     const timer = setTimeout(() => {
 *       resolve(`result for ${query}`);
 *     }, 50);
 *
 *     signal.addEventListener('abort', () => {
 *       clearTimeout(timer);
 *
 *       reject(new DOMException('aborted', 'AbortError'));
 *     });
 *   });
 *
 * const query$ = source<string>();
 *
 * const results$ = query$.pipe(
 *   switchMap((query) =>
 *     fromAbortablePromise((signal) => search(query, signal)),
 *   ),
 * );
 *
 * const valueHistory: Result<string, unknown>[] = [];
 *
 * results$.subscribe((result) => {
 *   valueHistory.push(result);
 * });
 *
 * query$.next('a');
 *
 * query$.next('b');
 *
 * await new Promise<void>((resolve) => {
 *   setTimeout(resolve, 150);
 * });
 *
 * assert.deepStrictEqual(valueHistory, [Result.ok('result for b')]);
 * ```
 */
export const fromAbortablePromise = <A, E = unknown>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  factory: (signal: AbortSignal) => Promise<A>,
): FromPromiseObservable<A, E> => {
  const abortController = new AbortController();

  return createRootObservable<Result<A, E>>(
    {
      initialValue: Optional.none,
      onComplete: () => {
        abortController.abort();
      },
    },
    ({ startUpdate, isCompleted, complete }) => {
      const promise = factory(abortController.signal);

      promise
        .then((value) => {
          if (isCompleted()) return;

          startUpdate(Result.ok(value));
        })
        .catch((error: unknown) => {
          if (isCompleted()) return;

          // Silently ignore AbortError — it means the observable was
          // intentionally completed (e.g., by switchMap).
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }

          startUpdate(
            Result.err(
              // eslint-disable-next-line total-functions/no-unsafe-type-assertion
              error as E,
            ),
          );
        })
        .finally(() => {
          complete();
        });

      return {};
    },
  );
};
