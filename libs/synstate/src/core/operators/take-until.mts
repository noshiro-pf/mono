import { Optional } from 'ts-data-forge';
import { createSyncChildObservable } from '../base/index.mjs';
import {
  type KeepInitialValueOperator,
  type Observable,
  type TakeUntilOperatorObservable,
} from '../types/index.mjs';

/**
 * Emits values from the source until the notifier observable emits.
 * When the notifier emits, this observable completes.
 *
 * @template A - The type of values from the source
 * @param notifier - An observable that signals when to complete
 * @returns An operator that takes values until notifier emits
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  num$          1         2         stop      3 (ignored)
 * //  stopNotifier                      X
 * //  limited$      1         2         |------- (completed)
 * //
 * //  Explanation:
 * //  - takeUntil completes the observable when the notifier emits
 * //  - After stop() is called, no further values are emitted
 * //  - Useful for cleanup and cancellation patterns
 *
 * const num$ = source<number>();
 *
 * const [stopNotifier, stop_] = createEventEmitter();
 *
 * const limited$ = num$.pipe(takeUntil(stopNotifier));
 *
 * const valueHistory: number[] = [];
 *
 * limited$.subscribe((x) => {
 *   valueHistory.push(x);
 * });
 *
 * num$.next(1); // logs: 1
 *
 * assert.deepStrictEqual(valueHistory, [1]);
 *
 * num$.next(2); // logs: 2
 *
 * assert.deepStrictEqual(valueHistory, [1, 2]);
 *
 * stop_();
 *
 * num$.next(3); // nothing logged (completed)
 *
 * assert.deepStrictEqual(valueHistory, [1, 2]);
 * ```
 */
export const takeUntil = <A,>(
  notifier: Observable<unknown>,
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    createTakeUntilObservable(
      parentObservable,
      notifier,
    )) as KeepInitialValueOperator<A, A>;

const createTakeUntilObservable = <A,>(
  parentObservable: Observable<A>,
  notifier: Observable<unknown>,
): TakeUntilOperatorObservable<A> => {
  const observable = createSyncChildObservable<A, readonly [A]>(
    {
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    },
    ({ setNext }) =>
      (updateToken) => {
        const par = parentObservable;

        const sn = par.getSnapshot();

        if (par.updateToken !== updateToken || Optional.isNone(sn)) {
          return; // skip update
        }

        setNext(sn.value, updateToken);
      },
  );

  notifier.subscribe(
    () => {
      observable.complete();
    },
    () => {
      observable.complete();
    },
  );

  return observable;
};
