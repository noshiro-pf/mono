import { Optional, Result } from 'ts-data-forge';
import { createRootObservable } from '../base/index.mjs';
import type {
  FromSubscribableObservable,
  Subscribable,
  Subscription,
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
): FromSubscribableObservable<A, E> => {
  let mut_subscription: Subscription | undefined = undefined;

  // Set once the subscribable has completed: its subscription is over, so
  // completing this observable must not unsubscribe from it again.
  let mut_isSourceCompleted = false;

  const unsubscribe = (): void => {
    if (!mut_isSourceCompleted) {
      mut_subscription?.unsubscribe();
    }

    mut_subscription = undefined;
  };

  return createRootObservable<Result<A, E>>(
    { initialValue: Optional.none, onComplete: unsubscribe },
    ({ startUpdate, isCompleted, complete }) => {
      const subscription = subscribable.subscribe(
        (nextValue) => {
          startUpdate(Result.ok(nextValue));
        },
        (error?: unknown) => {
          startUpdate(
            Result.err(
              // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
              error as E,
            ),
          );
        },
        () => {
          mut_isSourceCompleted = true;

          complete();
        },
      );

      // `subscribe` may have completed this observable before returning
      // the subscription, so `unsubscribe` above had nothing to release.
      if (isCompleted()) {
        if (!mut_isSourceCompleted) {
          subscription.unsubscribe();
        }
      } else {
        mut_subscription = subscription;
      }

      return {};
    },
  );
};
