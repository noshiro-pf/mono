import { Arr, Optional } from 'ts-data-forge';
import { AsyncChildObservableClass } from '../class/index.mjs';
import {
  type DropInitialValueOperator,
  type MergeMapOperatorObservable,
  type Observable,
  type Subscription,
  type UpdateToken,
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
    new MergeMapObservableClass(parentObservable, mapToObservable);

/**
 * Alias for `mergeMap`.
 * @see mergeMap
 */
export const flatMap = mergeMap;

class MergeMapObservableClass<A, B>
  extends AsyncChildObservableClass<B, readonly [A]>
  implements MergeMapOperatorObservable<A, B>
{
  readonly #mapToObservable: (curr: A) => Observable<B>;
  #mut_observables: readonly Observable<B>[];
  #mut_subscriptions: readonly Subscription[];

  constructor(
    parentObservable: Observable<A>,
    mapToObservable: (curr: A) => Observable<B>,
  ) {
    super({
      parents: [parentObservable],
      initialValue: Optional.none,
    });

    this.#mapToObservable = mapToObservable;

    this.#mut_observables = [];

    this.#mut_subscriptions = [];
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updateToken !== updateToken || Optional.isNone(sn)) {
      return; // skip update
    }

    const observable = this.#mapToObservable(sn.value);

    this.#mut_observables = Arr.toPushed(this.#mut_observables, observable);

    const subscription = observable.subscribe((curr) => {
      this.startUpdate(curr);
    });

    this.#mut_subscriptions = Arr.toPushed(
      this.#mut_subscriptions,
      subscription,
    );
  }

  override complete(): void {
    for (const s of this.#mut_subscriptions) {
      s.unsubscribe();
    }

    for (const o of this.#mut_observables) {
      o.complete();
    }

    super.complete();
  }
}
