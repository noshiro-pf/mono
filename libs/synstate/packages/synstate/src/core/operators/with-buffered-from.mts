import { Arr, Optional, pipe } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import {
  type KeepInitialValueOperator,
  type Observable,
  type UpdaterSymbol,
  type WithBufferedFromOperatorObservable,
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
 * const mut_history: (readonly [number, readonly string[]])[] = [];
 *
 * result$.subscribe(([triggerValue, bufferedData]) => {
 *   mut_history.push([triggerValue, bufferedData]);
 * });
 *
 * data$.next('a');
 *
 * data$.next('b');
 *
 * trigger$.next(1);
 *
 * assert.deepStrictEqual(mut_history, [[1, ['a', 'b']]]);
 *
 * data$.next('c');
 *
 * trigger$.next(2);
 *
 * assert.deepStrictEqual(mut_history, [
 *   [1, ['a', 'b']],
 *   [2, ['c']],
 * ]);
 * ```
 */
export const withBufferedFrom = <A, B>(
  observable: Observable<B>,
): KeepInitialValueOperator<A, readonly [A, readonly B[]]> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new WithBufferedFromObservableClass(
      parentObservable,
      observable,
    )) as KeepInitialValueOperator<A, readonly [A, readonly B[]]>;

export const withBuffered = withBufferedFrom; // alias

class WithBufferedFromObservableClass<A, B>
  extends SyncChildObservableClass<readonly [A, readonly B[]], readonly [A]>
  implements WithBufferedFromOperatorObservable<A, B>
{
  #mut_bufferedValues: readonly B[] = [];

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

    observable.subscribe((value) => {
      this.#mut_bufferedValues = Arr.toPushed(this.#mut_bufferedValues, value);
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Optional.isNone(sn)) {
      return; // skip update
    }

    this.setNext([sn.value, this.#mut_bufferedValues], updaterSymbol);

    this.#clearBuffer();
  }

  #clearBuffer(): void {
    this.#mut_bufferedValues = [];
  }
}
