// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why), so
// those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Optional } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import type {
  DropInitialValueOperator,
  Observable,
  SkipUntilOperatorObservable,
  Subscription,
  UpdateToken,
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
    new SkipUntilObservableClass(parentObservable, notifier);

class SkipUntilObservableClass<A>
  extends SyncChildObservableClass<A, readonly [A]>
  implements SkipUntilOperatorObservable<A>
{
  #mut_isSkipping: boolean;
  #mut_subscription: Subscription | undefined;

  constructor(parentObservable: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parentObservable],
      initialValue: Optional.none,
    });

    // A notifier that already holds a value, or has completed, would stop the
    // skipping inside `subscribe`, before the subscription is stored.
    this.#mut_isSkipping =
      Optional.isNone(notifier.getSnapshot()) && !notifier.isCompleted;

    this.#mut_subscription = undefined;

    if (this.#mut_isSkipping) {
      const stopSkipping = (): void => {
        this.#mut_isSkipping = false;

        this.#mut_subscription?.unsubscribe();

        this.#mut_subscription = undefined;
      };

      this.#mut_subscription = notifier.subscribe(stopSkipping, stopSkipping);
    }

    this.attach();
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (
      this.#mut_isSkipping ||
      par.updateToken !== updateToken ||
      Optional.isNone(sn)
    ) {
      return; // skip update
    }

    this.setNext(sn.value, updateToken);
  }

  protected override teardown(): void {
    this.#mut_subscription?.unsubscribe();
  }
}
