import { Optional } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type KeepInitialValueOperator,
  type Observable,
  type TakeUntilOperatorObservable,
  type UpdaterSymbol,
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
 * const mut_history: number[] = [];
 *
 * limited$.subscribe((x) => {
 *   mut_history.push(x);
 * });
 *
 * num$.next(1); // logs: 1
 *
 * assert.deepStrictEqual(mut_history, [1]);
 *
 * num$.next(2); // logs: 2
 *
 * assert.deepStrictEqual(mut_history, [1, 2]);
 *
 * stop_();
 *
 * num$.next(3); // nothing logged (completed)
 *
 * assert.deepStrictEqual(mut_history, [1, 2]);
 * ```
 */
export const takeUntil = <A,>(
  notifier: Observable<unknown>,
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new TakeUntilObservableClass(
      parentObservable,
      notifier,
    )) as KeepInitialValueOperator<A, A>;

class TakeUntilObservableClass<A>
  extends SyncChildObservableClass<A, readonly [A]>
  implements TakeUntilOperatorObservable<A>
{
  constructor(parentObservable: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    });

    notifier.subscribe(
      () => {
        this.complete();
      },
      () => {
        this.complete();
      },
    );
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Optional.isNone(sn)) {
      return; // skip update
    }

    this.setNext(sn.value, updaterSymbol);
  }
}
