import { Optional, Result } from 'ts-data-forge';
import { createRootObservable } from '../base/index.mjs';
import {
  type FromSubscribableObservable,
  type Subscribable,
} from '../types/index.mjs';

/**
 * Converts any subscribable object into a SynState Observable.
 * Works with objects that have a subscribe(onNext, onError, onComplete) method.
 *
 * @template A - The type of values from the subscribable
 * @template E - The type of errors from the subscribable
 * @param subscribable - An object with a subscribe method
 * @returns An observable that wraps values in Result type
 *
 * @example
 * ```ts
 * //  Explanation:
 * //  - fromSubscribable converts any subscribable object into a SynState Observable
 * //  - Works with objects that have a subscribe(onNext, onError, onComplete) method
 * //  - Wraps values in Result type for error handling
 * //  - Useful for integrating with other reactive libraries or custom subscribables
 *
 * // Example: Converting a custom subscribable
 * const customSubscribable = {
 *   subscribe: (
 *     onNext: (value: number) => void,
 *     _onError?: (error: unknown) => void,
 *     onComplete?: () => void,
 *   ) => {
 *     setTimeout(() => {
 *       onNext(1);
 *
 *       onNext(2);
 *
 *       onNext(3);
 *
 *       onComplete?.();
 *     }, 0);
 *
 *     return { unsubscribe: () => {} };
 *   },
 * } as const;
 *
 * const observable$ = fromSubscribable<number>(customSubscribable);
 *
 * const valueHistory: number[] = [];
 *
 * await new Promise<void>((resolve) => {
 *   observable$.subscribe(
 *     (result) => {
 *       if (Result.isOk(result)) {
 *         valueHistory.push(result.value);
 *       }
 *     },
 *     () => {
 *       resolve();
 *     },
 *   );
 * });
 *
 * assert.deepStrictEqual(valueHistory, [1, 2, 3]);
 * ```
 */
export const fromSubscribable = <A, E = unknown>(
  subscribable: Subscribable<A>,
): FromSubscribableObservable<A, E> =>
  createRootObservable<Result<A, E>>(
    { initialValue: Optional.none },
    ({ startUpdate, complete }) => {
      subscribable.subscribe(
        (nextValue) => {
          startUpdate(Result.ok(nextValue));
        },
        (error?: unknown) => {
          startUpdate(
            Result.err(
              // eslint-disable-next-line total-functions/no-unsafe-type-assertion
              error as E,
            ),
          );
        },
        () => {
          complete();
        },
      );

      return {};
    },
  );
