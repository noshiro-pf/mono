import { Optional } from 'ts-data-forge';
import { createAsyncChildObservable } from '../base/index.mjs';
import { createScope, getCurrentScope } from '../scope/index.mjs';
import type {
  DropInitialValueOperator,
  Observable,
  Scope,
  Subscription,
  SwitchMapOperatorObservable,
} from '../types/index.mjs';

/**
 * Projects each source value to an observable, subscribes to it, and emits its values.
 * When a new value arrives from the source, the previous inner observable is unsubscribed.
 *
 * The projection runs in a scope of its own (see `createScope`): what it
 * creates is disposed when the next value switches away from it and when
 * `switchMap` completes. An observable it only returns — one created outside
 * the projection and shared with others — is unsubscribed and left running.
 *
 * @template A - The type of values from the source
 * @template B - The type of values from the projected observable
 * @param mapToObservable - A function that maps each source value to an observable
 * @returns An operator that switches to new observables
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  input$      A                          B              C
 * //  inner A     A1    A2    A3
 * //  inner B                                B1    B2      (switched!)
 * //  inner C                                              C1    C2    C3
 * //  result$     A1    A2    A3              B1    B2      C1    C2    C3
 * //
 * //  Explanation:
 * //  - switchMap creates an inner observable for each source value
 * //  - When a new source value arrives, the previous inner is unsubscribed
 * //  - A's inner completes normally (all 3 values emitted)
 * //  - B's inner is interrupted by C (only 2 values emitted)
 * //  - C's inner completes normally (all 3 values emitted)
 *
 * const input$ = source<string>();
 *
 * const result$ = input$.pipe(
 *   switchMap((letter) => {
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
 * // Emit C - switches away from B (B3 cancelled), C's inner starts
 * input$.next('C');
 *
 * await sleep(250);
 *
 * assert.deepStrictEqual(valueHistory, [
 *   'A1',
 *   'A2',
 *   'A3',
 *   'B1',
 *   'B2',
 *   'C1',
 *   'C2',
 *   'C3',
 * ]);
 * ```
 */
export const switchMap =
  <A, B>(
    mapToObservable: (curr: A) => Observable<B>,
  ): DropInitialValueOperator<A, B> =>
  (parentObservable) =>
    createSwitchMapObservable(parentObservable, mapToObservable);

const createSwitchMapObservable = <A, B>(
  parentObservable: Observable<A>,
  mapToObservable: (curr: A) => Observable<B>,
): SwitchMapOperatorObservable<A, B> => {
  // The scope the operator was created in, so that each inner scope is
  // disposed with it; the projection itself runs during propagation, when the
  // current scope is whatever happens to be running.
  const ownerScope = getCurrentScope();

  let mut_innerScope: Scope | undefined = undefined;

  let mut_subscription: Subscription | undefined = undefined;

  return createAsyncChildObservable(
    {
      parents: [parentObservable],
      initialValue: Optional.none,
      onComplete: () => {
        mut_subscription?.unsubscribe();

        mut_innerScope?.dispose();
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

        mut_subscription?.unsubscribe();

        mut_innerScope?.dispose();

        const innerScope = createScope(ownerScope);

        mut_innerScope = innerScope;

        const observable = innerScope.run(() => mapToObservable(sn.value));

        const subscription = observable.subscribe((curr) => {
          startUpdate(curr);
        });

        mut_subscription = subscription;
      },
  );
};
