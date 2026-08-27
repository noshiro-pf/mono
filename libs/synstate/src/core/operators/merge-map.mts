import { Arr, Optional } from 'ts-data-forge';
import { createAsyncChildObservable } from '../base/index.mjs';
import {
  type DropInitialValueOperator,
  type MergeMapOperatorObservable,
  type Observable,
  type Subscription,
} from '../types/index.mjs';

/**
 * Projects each source value to an observable and merges all inner observables.
 * Unlike `switchMap`, does not cancel previous inner observables.
 *
 * @template A - The type of values from the source
 * @template B - The type of values from the projected observable
 * @param mapToObservable - A function that maps each source value to an observable
 * @returns An operator that merges mapped observables
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  input$      A                          B              C
 * //  inner A     A1    A2    A3
 * //  inner B                                B1    B2             B3
 * //  inner C                                              C1         C2    C3
 * //  result$     A1    A2    A3              B1    B2      C1    B3   C2    C3
 * //
 * //  Explanation:
 * //  - mergeMap creates an inner observable for each source value
 * //  - Unlike switchMap, previous inner observables are NOT cancelled
 * //  - B's inner continues even after C arrives (B3 is still emitted)
 * //  - All inner observables run concurrently and their results are merged
 *
 * const input$ = source<string>();
 *
 * const result$ = input$.pipe(
 *   mergeMap((letter) => {
 *     const inner$ = source<string>();
 *
 *     setTimeout(() => {
 *       inner$.next(`${letter}1`);
 *     }, 10);
 *
 *     setTimeout(() => {
 *       inner$.next(`${letter}2`);
 *     }, 110);
 *
 *     setTimeout(() => {
 *       inner$.next(`${letter}3`);
 *     }, 210);
 *
 *     return inner$;
 *   }),
 * );
 *
 * const valueHistory: string[] = [];
 *
 * result$.subscribe((value) => {
 *   valueHistory.push(value);
 * });
 *
 * const sleep = (ms: number): Promise<void> =>
 *   new Promise((resolve) => {
 *     setTimeout(resolve, ms);
 *   });
 *
 * // Emit A - inner emits A1, A2, A3 at 10ms, 110ms, 210ms
 * input$.next('A');
 *
 * await sleep(250);
 *
 * assert.deepStrictEqual(valueHistory, ['A1', 'A2', 'A3']);
 *
 * // Emit B - inner starts emitting B1, B2 at 10ms, 110ms
 * input$.next('B');
 *
 * await sleep(150);
 *
 * assert.deepStrictEqual(valueHistory, ['A1', 'A2', 'A3', 'B1', 'B2']);
 *
 * // Emit C while B's inner is still running (B3 at 210ms not yet fired)
 * // Unlike switchMap, B's inner is NOT cancelled
 * input$.next('C');
 *
 * await sleep(250);
 *
 * // B3 appears between C1 and C2, showing the merge behavior
 * assert.deepStrictEqual(valueHistory, [
 *   'A1',
 *   'A2',
 *   'A3',
 *   'B1',
 *   'B2',
 *   'C1',
 *   'B3',
 *   'C2',
 *   'C3',
 * ]);
 * ```
 *
 * @note To improve code readability, consider using `createState` instead of `mergeMap`,
 * subscribing to `parentObservable` and calling `setState` within it.
 */
export const mergeMap =
  <A, B>(
    mapToObservable: (curr: A) => Observable<B>,
  ): DropInitialValueOperator<A, B> =>
  (parentObservable) =>
    createMergeMapObservable(parentObservable, mapToObservable);

/**
 * Alias for `mergeMap`.
 * @see mergeMap
 */
export const flatMap = mergeMap;

const createMergeMapObservable = <A, B>(
  parentObservable: Observable<A>,
  mapToObservable: (curr: A) => Observable<B>,
): MergeMapOperatorObservable<A, B> => {
  let mut_observables: readonly Observable<B>[] = [];

  let mut_subscriptions: readonly Subscription[] = [];

  return createAsyncChildObservable(
    {
      parents: [parentObservable],
      initialValue: Optional.none,
      onComplete: () => {
        for (const s of mut_subscriptions) {
          s.unsubscribe();
        }

        for (const o of mut_observables) {
          o.complete();
        }
      },
    },
    ({ startUpdate }) =>
      (updateToken) => {
        const sn = parentObservable.getSnapshot();

        if (
          parentObservable.updateToken !== updateToken ||
          Optional.isNone(sn)
        ) {
          return; // skip update
        }

        const observable = mapToObservable(sn.value);

        mut_observables = Arr.toPushed(mut_observables, observable);

        const subscription = observable.subscribe((curr) => {
          startUpdate(curr);
        });

        mut_subscriptions = Arr.toPushed(mut_subscriptions, subscription);
      },
  );
};
