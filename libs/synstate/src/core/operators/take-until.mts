// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why),
// so those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Optional } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import type {
  KeepInitialValueOperator,
  Observable,
  Subscription,
  TakeUntilOperatorObservable,
  UpdateToken,
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
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  ((parentObservable) =>
    new TakeUntilObservableClass(
      parentObservable,
      notifier,
    )) as KeepInitialValueOperator<A, A>;

class TakeUntilObservableClass<A>
  extends SyncChildObservableClass<A, readonly [A]>
  implements TakeUntilOperatorObservable<A>
{
  /** Unset only while the `subscribe` in the constructor runs. */
  readonly #subscription: Subscription | undefined;

  constructor(parentObservable: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    });

    const complete = (): void => {
      this.complete();
    };

    // A notifier that already holds a value completes this observable inside
    // `subscribe`, before the subscription is stored.
    this.#subscription = notifier.subscribe(complete, complete);

    if (this.isCompleted) {
      this.#subscription.unsubscribe();
    }

    this.attach();
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updateToken !== updateToken || Optional.isNone(sn)) {
      return; // skip update
    }

    this.setNext(sn.value, updateToken);
  }

  protected override teardown(): void {
    this.#subscription?.unsubscribe();
  }
}
