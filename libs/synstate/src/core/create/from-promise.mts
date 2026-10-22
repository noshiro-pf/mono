// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why),
// so those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
import { Optional, Result } from 'ts-data-forge';
import { RootObservableClass } from '../class/index.mjs';
import type { FromPromiseObservable } from '../types/index.mjs';

/**
 * Creates an observable from a Promise.
 * Emits Result.ok when the promise resolves, or Result.err when it rejects.
 *
 * @template A - The type of the resolved value
 * @template E - The type of the error
 * @param promise - The promise to convert to observable
 * @returns An observable that emits the promise result
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  promise     [pending...]  -> resolved/rejected
 * //  data$                        Ok(value) or Err(error)
 * //
 * //  Explanation:
 * //  - fromPromise converts a Promise into an observable
 * //  - Emits a Result type: Ok(value) on success, Err(error) on failure
 * //  - Completes after emitting the result
 * //  - Useful for integrating async operations into reactive flows
 *
 * const fetchData = async (): Promise<Readonly<{ value: number }>> =>
 *   ({
 *     value: 42,
 *   }) as const;
 *
 * const data$ = fromPromise(fetchData());
 *
 * const valueHistory: Readonly<{ value: number }>[] = [];
 *
 * await new Promise<void>((resolve) => {
 *   data$.subscribe(
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
 * assert.deepStrictEqual(valueHistory, [{ value: 42 }]);
 * ```
 */
export const fromPromise = <A, E = unknown>(
  promise: Promise<A>,
): FromPromiseObservable<A, E> => new FromPromiseObservableClass(promise);

class FromPromiseObservableClass<A, E = unknown>
  extends RootObservableClass<Result<A, E>>
  implements FromPromiseObservable<A, E>
{
  constructor(promise: Promise<A>) {
    super({ initialValue: Optional.none });

    promise
      .then((value) => {
        if (this.isCompleted) {
          return;
        }

        this.startUpdate(Result.ok(value));
      })
      .catch((error: unknown) => {
        if (this.isCompleted) {
          return;
        }

        this.startUpdate(
          Result.err(
            // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
            error as E,
          ),
        );
      })
      .finally(() => {
        this.complete();
      });
  }
}
