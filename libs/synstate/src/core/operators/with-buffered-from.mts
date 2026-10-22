// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why),
// so those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import { Arr, Optional, pipe } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import type {
  KeepInitialValueOperator,
  Observable,
  Subscription,
  UpdateToken,
  WithBufferedFromOperatorObservable,
} from '../types/index.mjs';
import { maxDepth } from '../utils/index.mjs';

/**
 * Buffers values from the source observable and emits them along with the parent value
 * when the parent emits. The buffer is cleared after each emission.
 *
 * @template A - The type of values from the parent observable
 * @template B - The type of values from the source observable
 * @param observable - The observable whose values will be buffered
 * @returns An operator that emits tuples of [parentValue, bufferedValues]
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  data$       d1    d2    d3    d4    d5    d6    d7    d8
 * //  trigger$                T1                T2                T3
 * //  result$                 [T1,[d1,d2,d3]]   [T2,[d4,d5,d6]]   [T3,[d7,d8]]
 * //
 * //  Explanation:
 * //  - withBufferedFrom collects values from the source observable
 * //  - When the trigger emits, it emits a tuple of [triggerValue, bufferedValues]
 * //  - Buffer is cleared after each emission
 * //  - Useful for batching data collection triggered by events
 *
 * const data$ = source<string>();
 *
 * const trigger$ = source<number>();
 *
 * const result$ = trigger$.pipe(withBufferedFrom(data$));
 *
 * const valueHistory: (readonly [number, readonly string[]])[] = [];
 *
 * result$.subscribe(([triggerValue, bufferedData]) => {
 *   valueHistory.push([triggerValue, bufferedData]);
 * });
 *
 * data$.next('A');
 *
 * data$.next('B');
 *
 * trigger$.next(1);
 *
 * assert.deepStrictEqual(valueHistory, [[1, ['A', 'B']]]);
 *
 * data$.next('C');
 *
 * trigger$.next(2);
 *
 * assert.deepStrictEqual(valueHistory, [
 *   [1, ['A', 'B']],
 *   [2, ['C']],
 * ]);
 * ```
 */
export const withBufferedFrom = <A, B>(
  observable: Observable<B>,
): KeepInitialValueOperator<A, readonly [A, readonly B[]]> =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  ((parentObservable) =>
    new WithBufferedFromObservableClass(
      parentObservable,
      observable,
    )) as KeepInitialValueOperator<A, readonly [A, readonly B[]]>;

/**
 * Alias for `withBufferedFrom`.
 * @see withBufferedFrom
 */
export const withBuffered = withBufferedFrom;

class WithBufferedFromObservableClass<A, B>
  extends SyncChildObservableClass<readonly [A, readonly B[]], readonly [A]>
  implements WithBufferedFromOperatorObservable<A, B>
{
  readonly #subscription: Subscription;
  #mut_bufferedValues: readonly B[];

  constructor(parentObservable: Observable<A>, observable: Observable<B>) {
    super({
      parents: [parentObservable],
      depth: 1 + maxDepth([parentObservable, observable]),
      initialValue: pipe({
        par: parentObservable.getSnapshot(),
        me: observable.getSnapshot(),
      }).map(({ par, me }) =>
        Optional.isNone(par)
          ? Optional.none
          : Optional.some([
              par.value,
              Optional.isNone(me) ? [] : [me.value],
            ] as const),
      ).value,
    });

    this.#mut_bufferedValues = [];

    this.#subscription = observable.subscribe((value) => {
      this.#mut_bufferedValues = Arr.toPushed(this.#mut_bufferedValues, value);
    });

    this.attach();
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updateToken !== updateToken || Optional.isNone(sn)) {
      return; // skip update
    }

    this.setNext([sn.value, this.#mut_bufferedValues], updateToken);

    this.#mut_bufferedValues = [];
  }

  protected override teardown(): void {
    this.#subscription.unsubscribe();

    this.#mut_bufferedValues = [];
  }
}
