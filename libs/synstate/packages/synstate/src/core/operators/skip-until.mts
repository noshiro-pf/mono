import { Optional } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type DropInitialValueOperator,
  type Observable,
  type SkipUntilOperatorObservable,
  type UpdaterSymbol,
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
 * const mut_history: number[] = [];
 *
 * skipped$.subscribe((x) => {
 *   mut_history.push(x);
 * });
 *
 * num$.next(1); // nothing logged
 *
 * num$.next(2); // nothing logged
 *
 * assert.deepStrictEqual(mut_history, []);
 *
 * start_();
 *
 * num$.next(4); // logs: 4
 *
 * assert.deepStrictEqual(mut_history, [4]);
 *
 * num$.next(5); // logs: 5
 *
 * assert.deepStrictEqual(mut_history, [4, 5]);
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

  constructor(parentObservable: Observable<A>, notifier: Observable<unknown>) {
    super({
      parents: [parentObservable],
      initialValue: Optional.none,
    });

    this.#mut_isSkipping = true;

    notifier.subscribe(
      () => {
        this.#mut_isSkipping = false;
      },
      () => {
        this.#mut_isSkipping = false;
      },
    );
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (
      par.updaterSymbol !== updaterSymbol ||
      Optional.isNone(sn) ||
      this.#mut_isSkipping
    ) {
      return; // skip update
    }

    this.setNext(sn.value, updaterSymbol);
  }
}
