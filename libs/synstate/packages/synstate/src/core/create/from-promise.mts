import { Optional, Result } from 'ts-data-forge';
import { RootObservableClass } from '../class/index.mjs';
import { type FromPromiseObservable } from '../types/index.mjs';

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
 * const data$ = fromPromise(fetch('/api/data').then((r) => r.json()));
 *
 * data$.subscribe((result) => {
 *   if (Result.isOk(result)) {
 *     console.log('Data:', result.value);
 *   } else {
 *     console.error('Error:', result.value);
 *   }
 * });
 * ```
 */
export const fromPromise = <A, E = unknown>(
  promise: Readonly<Promise<A>>,
): FromPromiseObservable<A, E> => new FromPromiseObservableClass(promise);

class FromPromiseObservableClass<A, E = unknown>
  extends RootObservableClass<Result<A, E>>
  implements FromPromiseObservable<A, E>
{
  constructor(promise: Readonly<Promise<A>>) {
    super({ initialValue: Optional.none });

    promise
      .then((value) => {
        if (this.isCompleted) return;

        this.startUpdate(Result.ok(value));
      })
      .catch((error: unknown) => {
        if (this.isCompleted) return;

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
}
