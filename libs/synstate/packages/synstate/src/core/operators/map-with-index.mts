import {
  Optional,
  Result,
  SafeUint,
  asSafeUint,
  expectType,
} from 'ts-data-forge';
import { SyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import {
  type InitializedObservable,
  type KeepInitialValueOperator,
  type MapWithIndexOperatorObservable,
  type Observable,
  type UpdaterSymbol,
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
 * //  num$      "a"      "b"      "c"
 * //  indexed$  "0: a"   "1: b"   "2: c"
 * //
 * //  Explanation:
 * //  - mapWithIndex transforms each value along with its index
 * //  - Index starts at 0 and increments with each emission
 *
 * const num$ = source<string>();
 *
 * const indexed$ = num$.pipe(mapWithIndex((x, i) => `${i}: ${x}`));
 *
 * const mut_history: string[] = [];
 *
 * indexed$.subscribe((s) => {
 *   mut_history.push(s);
 * });
 *
 * num$.next('a'); // 0: a
 *
 * num$.next('b'); // 1: b
 *
 * num$.next('c'); // 2: c
 *
 * assert.deepStrictEqual(mut_history, ['0: a', '1: b', '2: c']);
 * ```
 */
export const mapWithIndex = <A, B>(
  mapFn: (x: A, index: SafeUint | -1) => B,
): KeepInitialValueOperator<A, B> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new MapWithIndexObservableClass(
      parentObservable,
      mapFn,
    )) as KeepInitialValueOperator<A, B>;

/* Specialized operators */

export const map = <A, B>(mapFn: (x: A) => B): KeepInitialValueOperator<A, B> =>
  mapWithIndex(mapFn);

export const mapTo = <A, B>(value: B): KeepInitialValueOperator<A, B> =>
  map(() => value);

export const pluck = <A, K extends keyof A>(
  key: K,
): KeepInitialValueOperator<A, A[K]> => map((a) => a[key]);

export const getKey = pluck; // alias

export const attachIndex = <A,>(): KeepInitialValueOperator<
  A,
  readonly [SafeUint | -1, A]
> => mapWithIndex((a, i) => [i, a] as const);

export const withIndex = attachIndex; // alias

export const unwrapOptional = <
  O extends UnknownOptional,
>(): KeepInitialValueOperator<O, Optional.Unwrap<O> | undefined> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  map(Optional.unwrap as Fn<O, Optional.Unwrap<O> | undefined>);

export const unwrapResultOk = <
  R extends UnknownResult,
>(): KeepInitialValueOperator<R, Result.UnwrapOk<R> | undefined> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  map(Result.unwrapOk as Fn<R, Result.UnwrapOk<R> | undefined>);

export const unwrapResultErr = <
  R extends UnknownResult,
>(): KeepInitialValueOperator<R, Result.UnwrapErr<R> | undefined> =>
  map(Result.unwrapErr as Fn<R, Result.UnwrapErr<R> | undefined>);

export const mapOptional = <O extends UnknownOptional, B>(
  mapFn: (x: Optional.Unwrap<O>) => B,
): KeepInitialValueOperator<O, Optional<B>> =>
  map((a) => Optional.map(a, mapFn));

export const mapResultOk = <R extends UnknownResult, S2>(
  mapFn: (x: Result.UnwrapOk<R>) => S2,
): KeepInitialValueOperator<R, Result<S2, Result.UnwrapErr<R>>> =>
  map((a) => Result.map(a, mapFn));

export const mapResultErr = <R extends UnknownResult, E2>(
  mapFn: (x: Result.UnwrapErr<R>) => E2,
): KeepInitialValueOperator<R, Result<Result.UnwrapOk<R>, E2>> =>
  map((a) => Result.mapErr(a, mapFn));

/* implementation */

class MapWithIndexObservableClass<A, B>
  extends SyncChildObservableClass<B, readonly [A]>
  implements MapWithIndexOperatorObservable<A, B>
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

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];

    const sn = par.getSnapshot();

    if (par.updaterSymbol !== updaterSymbol || Optional.isNone(sn)) {
      return; // skip update
    }

    this.#mut_index =
      this.#mut_index === -1 ? asSafeUint(0) : SafeUint.add(1, this.#mut_index);

    this.setNext(this.#mapFn(sn.value, this.#mut_index), updaterSymbol);
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  {
    const s: Observable<number> = source<number>();

    const _d1 = s.pipe(map((x) => x + 1));

    expectType<typeof _d1, Observable<number>>('=');
  }

  {
    const s = source<number>();

    const m: InitializedObservable<number> = s.pipe(withInitialValue(0));

    const _d = m.pipe(map((x) => x + 1));

    expectType<typeof _d, InitializedObservable<number>>('=');
  }
}
