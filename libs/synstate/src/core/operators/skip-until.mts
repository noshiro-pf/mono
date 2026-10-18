import { Optional } from 'ts-data-forge';
import { createSyncChildObservable } from '../base/index.mjs';
import type {
  DropInitialValueOperator,
  Observable,
  SkipUntilOperatorObservable,
  Subscription,
} from '../types/index.mjs';

/**
 * Skips all values from the source observable until the notifier observable emits.
 *
 * @template A - The type of values from the source
 * @param notifier - An observable that signals when to start emitting
 * @returns An operator that skips values until the notifier emits
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  num$          1     2     3     start   4     5     6
 * //  startNotifier                   X
 * //  skipped$                                4     5     6
 * //                |------ skipped -------|
 * //
 * //  Explanation:
 * //  - skipUntil ignores all values until the notifier emits
 * //  - After the notifier emits, all subsequent values are passed through
 * //  - Opposite of takeUntil (which completes when notifier emits)
 *
 * const num$ = source<number>();
 *
 * const [startNotifier, start_] = createEventEmitter();
 *
 * const skipped$ = num$.pipe(skipUntil(startNotifier));
 *
 * const valueHistory: number[] = [];
 *
 * skipped$.subscribe((x) => {
 *   valueHistory.push(x);
 * });
 *
 * num$.next(1); // nothing logged
 *
 * num$.next(2); // nothing logged
 *
 * assert.deepStrictEqual(valueHistory, []);
 *
 * start_();
 *
 * num$.next(4); // logs: 4
 *
 * assert.deepStrictEqual(valueHistory, [4]);
 *
 * num$.next(5); // logs: 5
 *
 * assert.deepStrictEqual(valueHistory, [4, 5]);
 * ```
 */
export const skipUntil =
  <A,>(notifier: Observable<unknown>): DropInitialValueOperator<A, A> =>
  (parentObservable) =>
    createSkipUntilObservable(parentObservable, notifier);

const createSkipUntilObservable = <A,>(
  parentObservable: Observable<A>,
  notifier: Observable<unknown>,
): SkipUntilOperatorObservable<A> => {
  // A notifier that already holds a value, or has completed, would call
  // `stopSkipping` inside `subscribe`, before the subscription is stored.
  let mut_isSkipping =
    Optional.isNone(notifier.getSnapshot()) && !notifier.isCompleted;

  let mut_subscription: Subscription | undefined = undefined;

  const stopSkipping = (): void => {
    mut_isSkipping = false;

    mut_subscription?.unsubscribe();

    mut_subscription = undefined;
  };

  const observable = createSyncChildObservable<A, readonly [A]>(
    {
      parents: [parentObservable],
      initialValue: Optional.none,
      onComplete: () => {
        mut_subscription?.unsubscribe();
      },
    },
    ({ setNext }) =>
      (updateToken) => {
        const sn = parentObservable.getSnapshot();

        if (
          mut_isSkipping ||
          parentObservable.updateToken !== updateToken ||
          Optional.isNone(sn)
        ) {
          return; // skip update
        }

        setNext(sn.value, updateToken);
      },
  );

  if (mut_isSkipping) {
    mut_subscription = notifier.subscribe(stopSkipping, stopSkipping);
  }

  return observable;
};
