import {
  asSafeUint,
  expectType,
  Optional,
  pipe,
  SafeUint,
} from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import {
  type DropInitialValueOperator,
  type FilterOperatorObservable,
  type InitializedObservable,
  type Observable,
  type UpdaterSymbol,
} from '../types/index.mjs';
import { withInitialValue } from './with-initial-value.mjs';

/**
 * Filters values emitted by the source observable based on a predicate function.
 * Only values that satisfy the predicate will be emitted by the resulting observable.
 *
 * @template A - The type of values from the source
 * @template B - The narrowed type when using type guard
 * @param predicate - A function that tests each value (receives value and index)
 * @returns An operator that filters the observable
 *
 * @example
 * ```ts
 * //  Timeline:
 * //
 * //  num$          1     2     3     4     5     6
 * //  even$               2           4           6
 * //
 * //  Explanation:
 * //  - filter passes through only values that satisfy the predicate
 * //  - Only even numbers (2, 4, 6) are emitted
 *
 * const num$ = source<number>();
 *
 * const even$ = num$.pipe(filter((x) => x % 2 === 0));
 *
 * const mut_history: number[] = [];
 *
 * even$.subscribe((x) => {
 *   mut_history.push(x);
 * });
 *
 * num$.next(1); // nothing logged
 *
 * num$.next(2); // logs: 2
 *
 * assert.deepStrictEqual(mut_history, [2]);
 *
 * num$.next(3); // nothing logged
 *
 * num$.next(4); // logs: 4
 *
 * assert.deepStrictEqual(mut_history, [2, 4]);
 *
 * num$.next(5);
 *
 * num$.next(6);
 *
 * assert.deepStrictEqual(mut_history, [2, 4, 6]);
 * ```
 */
export function filter<A, B extends A>(
  predicate: (value: A, index: SafeUint | -1) => value is B,
): DropInitialValueOperator<A, B>;

export function filter<A>(
  predicate: (value: A, index: SafeUint | -1) => boolean,
): DropInitialValueOperator<A, A>;

export function filter<A>(
  predicate: (value: A, index: SafeUint | -1) => boolean,
): DropInitialValueOperator<A, A> {
  return (parentObservable) =>
    new FilterObservableClass(parentObservable, predicate);
}

class FilterObservableClass<A>
  extends SyncChildObservableClass<A, readonly [A]>
  implements FilterOperatorObservable<A>
{
  readonly #predicate: (x: A, index: SafeUint | -1) => boolean;
  #mut_index: SafeUint | -1;

  constructor(
    parentObservable: Observable<A>,
    predicate: (x: A, index: SafeUint | -1) => boolean,
  ) {
    super({
      parents: [parentObservable],
      initialValue: pipe(parentObservable.getSnapshot()).map((sn) =>
        Optional.isNone(sn)
          ? Optional.none
          : predicate(sn.value, -1)
            ? sn
            : Optional.none,
      ).value,
    });

    this.#mut_index = -1;

    this.#predicate = predicate;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Optional.isNone(sn)) {
      return; // skip update
    }

    this.#mut_index =
      this.#mut_index === -1 ? asSafeUint(0) : SafeUint.add(1, this.#mut_index);

    if (this.#predicate(sn.value, this.#mut_index)) {
      this.setNext(sn.value, updaterSymbol);
    }
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  {
    const s: Observable<number> = source<number>();

    const _d1 = s.pipe(filter((x) => x % 2 === 0));

    expectType<typeof _d1, Observable<number>>('=');
  }

  {
    const s = source<number>();

    const m: InitializedObservable<number> = s.pipe(withInitialValue(0));

    const _d = m.pipe(filter((x) => x % 2 === 0));

    expectType<typeof _d, Observable<number>>('=');
  }
}
