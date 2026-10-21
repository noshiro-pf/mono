import { Optional, SafeUint, asSafeUint, expectType } from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import {
  type InitializedObservable,
  type KeepInitialValueOperator,
  type MapOperatorObservable,
  type Observable,
  type UpdateToken,
} from '../types/index.mjs';
import { withInitialValue } from './with-initial-value.mjs';

/**
 * Transforms each value emitted by the source using a mapping function that also receives the emission index.
 *
 * @template A - The type of values from the source
 * @template B - The type of mapped values
 * @param mapFn - A function that maps each value (receives value and index)
 * @returns An operator that maps values with index
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  num$      "A"      "B"      "C"
 * //  indexed$  "0: A"   "1: B"   "2: C"
 * //
 * //  Explanation:
 * //  - mapWithIndex transforms each value along with its index
 * //  - Index starts at 0 and increments with each emission
 *
 * const num$ = source<string>();
 *
 * const indexed$ = num$.pipe(map((x, i) => `${i}: ${x}`));
 *
 * const valueHistory: string[] = [];
 *
 * indexed$.subscribe((s) => {
 *   valueHistory.push(s);
 * });
 *
 * num$.next('A'); // 0: A
 *
 * num$.next('B'); // 1: B
 *
 * num$.next('C'); // 2: C
 *
 * assert.deepStrictEqual(valueHistory, ['0: A', '1: B', '2: C']);
 * ```
 */
export const map = <A, B>(
  mapFn: (x: A, index: SafeUint | -1) => B,
): KeepInitialValueOperator<A, B> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new MapObservableClass(
      parentObservable,
      mapFn,
    )) as KeepInitialValueOperator<A, B>;

/* implementation */

class MapObservableClass<A, B>
  extends SyncChildObservableClass<B, readonly [A]>
  implements MapOperatorObservable<A, B>
{
  readonly #mapFn: (x: A, index: SafeUint | -1) => B;
  #mut_index: SafeUint | -1;

  constructor(
    parentObservable: Observable<A>,
    mapFn: (x: A, index: SafeUint | -1) => B,
  ) {
    super({
      parents: [parentObservable],
      initialValue: Optional.map(parentObservable.getSnapshot(), (x) =>
        mapFn(x, -1),
      ),
    });

    this.#mut_index = -1;

    this.#mapFn = mapFn;
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updateToken !== updateToken || Optional.isNone(sn)) {
      return; // skip update
    }

    this.#mut_index =
      this.#mut_index === -1 ? asSafeUint(0) : SafeUint.add(1, this.#mut_index);

    this.setNext(this.#mapFn(sn.value, this.#mut_index), updateToken);
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  {
    const s: Observable<number> = source<number>();

    const _d1 = s.pipe(map((x, i) => x + i));

    expectType<typeof _d1, Observable<number>>('=');
  }

  {
    const s = source<number>();

    const m: InitializedObservable<number> = s.pipe(withInitialValue(0));

    const _d = m.pipe(map((x, i) => x + i));

    expectType<typeof _d, InitializedObservable<number>>('=');
  }
}
