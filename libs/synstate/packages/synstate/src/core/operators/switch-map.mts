import { Optional } from 'ts-data-forge';
import { AsyncChildObservableClass } from '../class/index.mjs';
import {
  type DropInitialValueOperator,
  type Observable,
  type Subscription,
  type SwitchMapOperatorObservable,
  type UpdaterSymbol,
} from '../types/index.mjs';

/**
 * Projects each source value to an observable, subscribes to it, and emits its values.
 * When a new value arrives from the source, the previous inner observable is unsubscribed.
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
 * //  searchQuery$  "a"       "ab"      "abc"
 * //  requests      fetch1    fetch2    fetch3
 * //  results$                cancel    cancel    result3
 * //                          fetch1    fetch2
 * //
 * //  Explanation:
 * //  - switchMap cancels previous inner observables when a new value arrives
 * //  - Only the result from the latest search query is emitted
 * //  - Previous ongoing requests are cancelled
 * //  - Ideal for search-as-you-type scenarios
 *
 * const searchQuery$ = source<string>();
 *
 * const results$ = searchQuery$.pipe(
 *   switchMap((query) => {
 *     const result$ = source<string[]>();
 *
 *     setTimeout(() => {
 *       result$.next([query]);
 *
 *       result$.complete();
 *     }, 10);
 *
 *     return result$;
 *   }),
 * );
 *
 * const mut_history: string[][] = [];
 *
 * results$.subscribe((value) => {
 *   mut_history.push(value);
 * });
 *
 * searchQuery$.next('a');
 *
 * searchQuery$.next('ab');
 *
 * searchQuery$.next('abc');
 *
 * await new Promise((resolve) => {
 *   setTimeout(resolve, 200);
 * });
 *
 * assert.deepStrictEqual(mut_history, [['abc']]);
 * ```
 *
 * @note To improve code readability, consider using `createState` instead of `switchMap`,
 * subscribe to `parentObservable` and call `setState` within it.
 */
export const switchMap =
  <A, B>(
    mapToObservable: (curr: A) => Observable<B>,
  ): DropInitialValueOperator<A, B> =>
  (parentObservable) =>
    new SwitchMapObservableClass(parentObservable, mapToObservable);

class SwitchMapObservableClass<A, B>
  extends AsyncChildObservableClass<B, readonly [A]>
  implements SwitchMapOperatorObservable<A, B>
{
  readonly #mapToObservable: (curr: A) => Observable<B>;
  #mut_observable: Observable<B> | undefined;
  #mut_subscription: Subscription | undefined;

  constructor(
    parentObservable: Observable<A>,
    mapToObservable: (curr: A) => Observable<B>,
  ) {
    super({
      parents: [parentObservable],
      initialValue: Optional.none,
    });

    this.#mapToObservable = mapToObservable;

    this.#mut_observable = undefined;

    this.#mut_subscription = undefined;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Optional.isNone(sn)) {
      return; // skip update
    }

    this.#mut_observable?.complete();

    this.#mut_subscription?.unsubscribe();

    const observable = this.#mapToObservable(sn.value);

    this.#mut_observable = observable;

    const subscription = observable.subscribe((curr) => {
      this.startUpdate(curr);
    });

    this.#mut_subscription = subscription;
  }

  override complete(): void {
    this.#mut_subscription?.unsubscribe();

    this.#mut_observable?.complete();

    super.complete();
  }
}
