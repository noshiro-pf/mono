// Sumi bans classes, `this`, method syntax and writes to `this` outside a
// `mut_` binding; an observable is a class (`ObservableBaseClass` says why),
// so those rules are waived here (D-63).
// @sumi-expect-error-file classes/no-class
// @sumi-expect-error-file banned-syntax/no-this
// @sumi-expect-error-file functions/prefer-arrow-function
// @sumi-expect-error-file mutation/no-mutation-without-mut-prefix
import {
  asSafeUint,
  expectType,
  isNotUndefined,
  isString,
  Optional,
  pipe,
  SafeUint,
} from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import type {
  DropInitialValueOperator,
  FilterOperatorObservable,
  InitializedObservable,
  Observable,
  UpdateToken,
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
 * const valueHistory: number[] = [];
 *
 * even$.subscribe((x) => {
 *   valueHistory.push(x);
 * });
 *
 * num$.next(1); // nothing logged
 *
 * num$.next(2); // logs: 2
 *
 * assert.deepStrictEqual(valueHistory, [2]);
 *
 * num$.next(3); // nothing logged
 *
 * num$.next(4); // logs: 4
 *
 * assert.deepStrictEqual(valueHistory, [2, 4]);
 *
 * num$.next(5);
 *
 * num$.next(6);
 *
 * assert.deepStrictEqual(valueHistory, [2, 4, 6]);
 * ```
 */
export function filter<A, B extends A>(
  predicate: (value: A, index: SafeUint | -1) => value is B,
): DropInitialValueOperator<A, B>;

// A type-guard predicate and a boolean one are both functions at run time, so
// this set only refines the return type (#1952). It stays overloaded because
// one signature with a union parameter infers `unknown` for a generic guard
// such as `isNotUndefined`; see the type test below.
// @sumi-expect-error functions/no-refinement-overload
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

    this.attach();
  }

  override tryUpdate(updateToken: UpdateToken): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updateToken !== updateToken || Optional.isNone(sn)) {
      return; // skip update
    }

    this.#mut_index =
      this.#mut_index === -1 ? asSafeUint(0) : SafeUint.add(1, this.#mut_index);

    if (this.#predicate(sn.value, this.#mut_index)) {
      this.setNext(sn.value, updateToken);
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

  {
    const s = source<number | undefined>();

    const _guarded = s.pipe(filter((x): x is number => x !== undefined));

    expectType<typeof _guarded, Observable<number>>('=');

    const _inferred = s.pipe(filter((x) => x !== undefined));

    expectType<typeof _inferred, Observable<number>>('=');

    // A generic guard is what a single signature with a union parameter
    // loses (it infers `unknown`), and why this set stays overloaded.
    const _generic = s.pipe(filter(isNotUndefined));

    expectType<typeof _generic, Observable<number>>('=');

    const _withIndex = s.pipe(filter((x, i) => i === -1 || x === 0));

    expectType<typeof _withIndex, Observable<number | undefined>>('=');
  }

  {
    const _d = source<unknown>().pipe(filter(isString));

    expectType<typeof _d, Observable<string>>('=');

    const _standalone = filter((x: number) => x > 0);

    expectType<typeof _standalone, DropInitialValueOperator<number, number>>(
      '=',
    );
  }
}
