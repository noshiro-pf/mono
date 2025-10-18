import { expectType } from '../../expect-type.mjs';
import { range as rangeIterator } from '../../iterator/index.mjs';

/**
 * Creates an array of zeros with the specified length.
 *
 * @example
 *
 * ```ts
 * const emptyZeros = Arr.zeros(0);
 * const threeZeros = Arr.zeros(3);
 *
 * assert.deepStrictEqual(emptyZeros, []);
 * assert.deepStrictEqual(threeZeros, [0, 0, 0]);
 * ```
 */
export const zeros = <N extends SizeType.ArgArr>(
  len: N,
): N extends SmallUint
  ? ArrayOfLength<N, 0>
  : N extends SizeType.ArgArrPositive
    ? NonEmptyArray<0>
    : readonly 0[] =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Array.from<0>({ length: len }).fill(0) as never;

/**
 * Creates a sequence of consecutive integers from 0 to `len-1`.
 *
 * @example
 *
 * ```ts
 * const emptySeq = Arr.seq(0);
 * const firstFive = Arr.seq(5);
 *
 * assert.deepStrictEqual(emptySeq, []);
 * assert.deepStrictEqual(firstFive, [0, 1, 2, 3, 4]);
 * ```
 */
export const seq = <N extends SizeType.ArgArr>(
  len: N,
): N extends SmallUint
  ? Seq<N>
  : N extends SizeType.ArgArrPositive
    ? NonEmptyArray<SizeType.Arr>
    : readonly SizeType.Arr[] =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Array.from({ length: len }, (_, i) => i) as never;

/**
 * Creates a new array of the specified length, filled with the initial value.
 *
 * @example
 *
 * ```ts
 * const threeOnes = Arr.create(3, 1);
 * const emptyStrings = Arr.create(0, 'Ada');
 *
 * assert.deepStrictEqual(threeOnes, [1, 1, 1]);
 * assert.deepStrictEqual(emptyStrings, []);
 * ```
 */
export const create = <const V, N extends SizeType.ArgArr>(
  len: N,
  init: V,
): N extends SmallUint
  ? ArrayOfLength<N, V>
  : N extends SizeType.ArgArrPositive
    ? NonEmptyArray<V>
    : readonly V[] =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Array.from({ length: Math.max(0, len) }, () => init) as never;

/**
 * Alias for `create`.
 *
 * @see {@link create}
 */
export const newArray = create;

/**
 * Generates an array from a generator function.
 *
 * @example
 *
 * ```ts
 * const numbers = Arr.generate(function* () {
 *   yield 1;
 *   yield 2;
 *   yield 3;
 * });
 *
 * assert.deepStrictEqual(numbers, [1, 2, 3]);
 * ```
 */
export const generate = <T,>(
  generatorFn: () => Generator<T, void, unknown>,
): readonly T[] => Array.from(generatorFn());

/**
 * Generates an array from an async generator function.
 *
 * @example
 *
 * ```ts
 * const values = await Arr.generateAsync(async function* () {
 *   yield 'Ada';
 *   await Promise.resolve();
 *   yield 'Lovelace';
 * });
 *
 * assert.deepStrictEqual(values, ['Ada', 'Lovelace']);
 * ```
 */
export const generateAsync = <T,>(
  generatorFn: () => AsyncGenerator<T, void, unknown>,
): Promise<readonly T[]> => Array.fromAsync(generatorFn());

/**
 * Creates a shallow copy of an array.
 *
 * @example
 *
 * ```ts
 * const original = [{ id: 1 }, { id: 2 }] as const;
 * const cloned = Arr.copy(original);
 *
 * assert.deepStrictEqual(cloned, original);
 * assert.notStrictEqual(cloned, original);
 * ```
 */
export const copy = <const Ar extends readonly unknown[]>(array: Ar): Ar =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  array.slice() as unknown as Ar;

type LT = Readonly<{
  [N in SmallUint]: Index<N>;
}>;

type RangeList<S extends SmallUint, E extends SmallUint> =
  BoolOr<IsUnion<S>, IsUnion<E>> extends true
    ? readonly RelaxedExclude<LT[E], LT[Min<S>]>[] // Avoid incorrect type calculation for unions with Seq
    : List.Skip<S, Seq<E>>;

expectType<RangeList<1, 5>, readonly [1, 2, 3, 4]>('=');
expectType<RangeList<1, 2>, readonly [1]>('=');
expectType<RangeList<1, 1>, readonly []>('=');
expectType<RangeList<1, 1 | 3>, readonly (1 | 2)[]>('=');
expectType<RangeList<1 | 3, 3 | 5>, readonly (1 | 2 | 3 | 4)[]>('=');
expectType<RangeList<1 | 2 | 3, 5 | 6 | 7>, readonly (1 | 2 | 3 | 4 | 5 | 6)[]>(
  '=',
);
expectType<RangeList<5, 1>, readonly []>('=');

/**
 * Creates an array of numbers within a specified range with optional step.
 *
 * @example
 *
 * ```ts
 * const ascending = Arr.range(asUint32(1), asUint32(5));
 * const empty = Arr.range(asUint32(2), asUint32(2));
 *
 * assert.deepStrictEqual(ascending, [1, 2, 3, 4]);
 * assert.deepStrictEqual(empty, []);
 * ```
 */
export function range<S extends SmallUint, E extends SmallUint>(
  start: S,
  end: E,
  step?: 1,
): RangeList<S, E>;

export function range(
  start: SafeUintWithSmallInt,
  end: SafeUintWithSmallInt,
  step?: PositiveSafeIntWithSmallInt,
): readonly SafeUint[];

export function range(
  start: SafeIntWithSmallInt,
  end: SafeIntWithSmallInt,
  step?: NonZeroSafeIntWithSmallInt,
): readonly SafeInt[];

export function range(
  start: SafeIntWithSmallInt,
  end: SafeIntWithSmallInt,
  step: NonZeroSafeIntWithSmallInt = 1,
): readonly SafeInt[] {
  return Array.from(rangeIterator(start, end, step));
}
