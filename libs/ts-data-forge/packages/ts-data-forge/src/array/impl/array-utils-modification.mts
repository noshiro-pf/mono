import {
  type ChangeArrayElement,
  type ConstrainedList,
  type FixedLengthTuple,
  type Increment,
  type IsFixedLengthList,
  type NonEmptyArray,
  type UnknownBrand,
} from 'ts-type-forge';
import { asPositiveUint32 } from '../../number/index.mjs';
import { castMutable } from '../../others/index.mjs';
import {
  type ArgArrayIndex,
  type ArgArrayIndexWithNegative,
  type SizeType,
} from '../../types.mjs';
import { copy, create } from './array-utils-creation.mjs';

/**
 * Returns a new array with an element at the specified index replaced.
 *
 * @example
 *
 * ```ts
 * const scores: readonly number[] = [10, 20, 30] as const;
 *
 * const updated = Arr.set(scores, 1, 25);
 *
 * assert.deepStrictEqual(updated, [10, 25, 30]);
 * ```
 */
export function set<
  const Ar extends readonly unknown[],
  const I extends ArgArrayIndex<Ar>,
  const V = Ar[number],
>(array: Ar, index: I, newValue: V): ReplacedAt<Ar, I, V>;

// curried version
export function set<const I extends SizeType.ArgArr, const V>(
  index: I,
  newValue: V,
): <const Ar extends readonly unknown[]>(array: Ar) => ReplacedAt<Ar, I, V>;

export function set<E, const V = E>(
  ...args:
    | readonly [array: readonly E[], index: SizeType.ArgArr, newValue: V]
    | readonly [index: SizeType.ArgArr, newValue: V]
): readonly (E | V)[] | ((array: readonly E[]) => readonly (E | V)[]) {
  switch (args.length) {
    case 3:
      return setImpl(...args);

    case 2:
      return (array) => setImpl(array, ...args);
  }
}

const setImpl = <E, const V = E>(
  array: readonly E[],
  index: SizeType.ArgArr,
  newValue: V,
): readonly (E | V)[] => (array as readonly (E | V)[]).with(index, newValue);

/**
 * Returns a new array with an element at the specified index updated by applying a function.
 *
 * @example
 *
 * ```ts
 * const temperatures: readonly number[] = [20, 21, 22] as const;
 *
 * const increased = Arr.toUpdated(temperatures, 1, (value) => value + 5);
 *
 * const incrementLast = Arr.toUpdated<2, number>(
 *   2,
 *   (value) => value + 1,
 * )(temperatures);
 *
 * assert.deepStrictEqual(increased, [20, 26, 22]);
 *
 * assert.deepStrictEqual(incrementLast, [20, 21, 23]);
 * ```
 */
export function toUpdated<
  const Ar extends readonly unknown[],
  const I extends ArgArrayIndex<Ar>,
  const V = Ar[number],
>(array: Ar, index: I, updater: (prev: Ar[number]) => V): ReplacedAt<Ar, I, V>;

// curried version
export function toUpdated<const I extends SizeType.ArgArr, E, const V = E>(
  index: I,
  updater: (prev: E) => V,
): <const Ar extends readonly E[]>(array: Ar) => ReplacedAt<Ar, I, V>;

export function toUpdated<E, V = E>(
  ...args:
    | readonly [
        array: readonly E[],
        index: SizeType.ArgArr,
        updater: (prev: E) => V,
      ]
    | readonly [index: SizeType.ArgArr, updater: (prev: E) => V]
): readonly (E | V)[] | ((array: readonly E[]) => readonly (E | V)[]) {
  switch (args.length) {
    case 3:
      return toUpdatedImpl(...args);

    case 2:
      return (array) => toUpdatedImpl(array, ...args);
  }
}

const toUpdatedImpl = <E, V = E>(
  array: readonly E[],
  index: SizeType.ArgArr,
  updater: (prev: E) => V,
): readonly (E | V)[] =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  (array as readonly (E | V)[]).with(index, updater(array[index]!));

/**
 * Returns a new array with a value inserted at the specified index.
 *
 * @example
 *
 * ```ts
 * const numbers = [1, 2, 4] as const;
 *
 * const withThree = Arr.toInserted(numbers, 2, 3);
 *
 * const appendFive = Arr.toInserted(3, 5)(numbers);
 *
 * assert.deepStrictEqual(withThree, [1, 2, 3, 4]);
 *
 * assert.deepStrictEqual(appendFive, [1, 2, 4, 5]);
 * ```
 */
export function toInserted<
  const Ar extends readonly unknown[],
  const V = Ar[number],
>(
  array: Ar,
  index: ArgArrayIndexWithNegative<Ar>,
  newValue: V,
): IsFixedLengthList<Ar> extends true
  ? FixedLengthTuple<CastToNumber<Increment<Ar['length']>>, Ar[number] | V>
  : NonEmptyArray<Ar[number] | V>;

// curried version
export function toInserted<const V>(
  index: SizeType.ArgArrWithNegative,
  newValue: V,
): <const Ar extends readonly unknown[]>(
  array: Ar,
) => IsFixedLengthList<Ar> extends true
  ? FixedLengthTuple<CastToNumber<Increment<Ar['length']>>, Ar[number] | V>
  : NonEmptyArray<Ar[number] | V>;

export function toInserted<E, const V = E>(
  ...args:
    | readonly [
        array: readonly E[],
        index: SizeType.ArgArrWithNegative,
        newValue: V,
      ]
    | readonly [index: SizeType.ArgArrWithNegative, newValue: V]
): NonEmptyArray<E | V> | ((array: readonly E[]) => NonEmptyArray<E | V>) {
  switch (args.length) {
    case 3:
      return toInsertedImpl(...args);

    case 2:
      return (array) => toInsertedImpl(array, ...args);
  }
}

const toInsertedImpl = <E, const V = E>(
  array: readonly E[],
  index: SizeType.ArgArrWithNegative,
  newValue: V,
): NonEmptyArray<E | V> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  (array as readonly (E | V)[]).toSpliced(
    index,
    0,
    newValue,
  ) as unknown as NonEmptyArray<E | V>;

type CastToNumber<T> = T extends number ? T : never;

/**
 * Returns a new array with the element at the specified index removed.
 *
 * @example
 *
 * ```ts
 * const letters = ['a', 'b', 'c', 'd'] as const;
 *
 * const withoutSecond = Arr.toRemoved(letters, 1);
 *
 * const withoutFirstCurried = Arr.toRemoved(0)(letters);
 *
 * assert.deepStrictEqual(withoutSecond, ['a', 'c', 'd']);
 *
 * assert.deepStrictEqual(withoutFirstCurried, ['b', 'c', 'd']);
 * ```
 */
export function toRemoved<const Ar extends readonly unknown[]>(
  array: Ar,
  index: ArgArrayIndexWithNegative<Ar>,
): readonly Ar[number][];

export function toRemoved(
  index: SizeType.ArgArrWithNegative,
): <E>(array: readonly E[]) => readonly E[];

export function toRemoved<E>(
  ...args:
    | readonly [array: readonly E[], index: SizeType.ArgArrWithNegative]
    | readonly [index: SizeType.ArgArrWithNegative]
): readonly E[] | ((array: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2:
      return toRemovedImpl(...args);

    case 1:
      return (array) => toRemovedImpl(array, ...args);
  }
}

const toRemovedImpl = <E,>(
  array: readonly E[],
  index: SizeType.ArgArrWithNegative,
): readonly E[] => array.toSpliced(index, 1);

/**
 * Returns a new array with a value appended to the end.
 *
 * @example
 *
 * ```ts
 * const base = [1, 2] as const;
 *
 * const appended = Arr.toPushed(base, 3);
 *
 * const appendedCurried = Arr.toPushed(4)(base);
 *
 * // The result is guaranteed non-empty, so it is assignable to NonEmptyArray.
 * const nonEmpty: NonEmptyArray<number> = appended;
 *
 * assert.deepStrictEqual<readonly number[]>(appended, [1, 2, 3]);
 *
 * assert.deepStrictEqual<readonly number[]>(appendedCurried, [1, 2, 4]);
 *
 * assert.isTrue(nonEmpty.length >= 1);
 * ```
 */
export function toPushed<const Ar extends readonly unknown[], const V>(
  array: Ar,
  newValue: V,
): readonly [...Ar, V] & NonEmptyArray<Ar[number] | V>;

export function toPushed<const V>(
  newValue: V,
): <const Ar extends readonly unknown[]>(
  array: Ar,
) => readonly [...Ar, V] & NonEmptyArray<Ar[number] | V>;

export function toPushed<const Ar extends readonly unknown[], const V>(
  ...args: readonly [array: Ar, newValue: V] | readonly [newValue: V]
): readonly [...Ar, V] | ((array: Ar) => readonly [...Ar, V]) {
  switch (args.length) {
    case 2:
      return toPushedImpl(...args);

    case 1:
      return (array) => toPushedImpl(array, ...args);
  }
}

const toPushedImpl = <const Ar extends readonly unknown[], const V>(
  array: Ar,
  newValue: V,
): readonly [...Ar, V] =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  array.toSpliced(array.length, 0, newValue) as unknown as readonly [...Ar, V];

/**
 * Returns a new array with a value prepended to the beginning.
 *
 * @example
 *
 * ```ts
 * const base = [2, 3] as const;
 *
 * const prefixed = Arr.toUnshifted(base, 1);
 *
 * const prefixedCurried = Arr.toUnshifted(0)(base);
 *
 * // The result is guaranteed non-empty, so it is assignable to NonEmptyArray.
 * const nonEmpty: NonEmptyArray<number> = prefixed;
 *
 * assert.deepStrictEqual<readonly number[]>(prefixed, [1, 2, 3]);
 *
 * assert.deepStrictEqual<readonly number[]>(prefixedCurried, [0, 2, 3]);
 *
 * assert.isTrue(nonEmpty.length >= 1);
 * ```
 */
export function toUnshifted<const Ar extends readonly unknown[], const V>(
  array: Ar,
  newValue: V,
): readonly [V, ...Ar] & NonEmptyArray<V | Ar[number]>;

export function toUnshifted<const V>(
  newValue: V,
): <const Ar extends readonly unknown[]>(
  array: Ar,
) => readonly [V, ...Ar] & NonEmptyArray<V | Ar[number]>;

export function toUnshifted<Ar extends readonly unknown[], const V>(
  ...args: readonly [array: Ar, newValue: V] | readonly [newValue: V]
): readonly [V, ...Ar] | ((array: Ar) => readonly [V, ...Ar]) {
  switch (args.length) {
    case 2:
      return toUnshiftedImpl(...args);

    case 1:
      return (array) => toUnshiftedImpl(array, ...args);
  }
}

const toUnshiftedImpl = <Ar extends readonly unknown[], const V>(
  array: Ar,
  newValue: V,
): readonly [V, ...Ar] =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  array.toSpliced(0, 0, newValue) as unknown as readonly [V, ...Ar];

/**
 * Returns a new array with all elements replaced by the specified value.
 *
 * @example
 *
 * ```ts
 * const base = [1, 2, 3] as const;
 *
 * const filled = Arr.toFilled(base, 0);
 *
 * const filledCurried = Arr.toFilled('x')(base);
 *
 * assert.deepStrictEqual(filled, [0, 0, 0]);
 *
 * assert.deepStrictEqual(filledCurried, ['x', 'x', 'x']);
 * ```
 */
export function toFilled<
  const Ar extends readonly unknown[] & UnknownBrand,
  const V,
>(array: Ar, value: V): ChangeArrayElement<Ar, V>;

// For an array or tuple that carries no length brand the homomorphic mapping
// already covers every case the conditional spelled out — a fixed-length tuple
// keeps its length, `readonly [A, ...A[]]` stays non-empty, and `readonly A[]`
// stays unbounded. Stating it directly is what keeps this usable from a
// caller that is itself generic over the array: a conditional a *generic* `Ar`
// cannot decide stays deferred, and its branded branch is then not assignable
// to the caller's own mapping.
export function toFilled<const Ar extends readonly unknown[], const V>(
  array: Ar,
  value: V,
): Readonly<{ [K in keyof Ar]: V }>;

// curried version — the two cases have to be overloads of the *returned*
// function, spelled as an intersection of function types (see `Arr.map`).
export function toFilled<const V>(
  value: V,
): (<const Ar extends readonly unknown[] & UnknownBrand>(
  array: Ar,
) => ChangeArrayElement<Ar, V>) &
  (<const Ar extends readonly unknown[]>(
    array: Ar,
  ) => Readonly<{ [K in keyof Ar]: V }>);

export function toFilled<E>(
  ...args: readonly [array: readonly E[], value: E] | readonly [value: E]
): readonly E[] | ((array: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2:
      return toFilledImpl(...args);

    case 1:
      return (array) => toFilledImpl(array, ...args);
  }
}

const toFilledImpl = <E,>(array: readonly E[], value: E): readonly E[] =>
  create(asPositiveUint32(array.length), value);

/**
 * Returns a new array with elements in the specified range replaced by the specified value.
 *
 * @example
 *
 * ```ts
 * const base = [0, 1, 2, 3, 4] as const;
 *
 * const filledMiddle = Arr.toRangeFilled(base, 9, [1, 4]);
 *
 * const filledPrefix = Arr.toRangeFilled(8, [0, 2])(base);
 *
 * assert.deepStrictEqual(filledMiddle, [0, 9, 9, 9, 4]);
 *
 * assert.deepStrictEqual(filledPrefix, [8, 8, 2, 3, 4]);
 * ```
 */
export function toRangeFilled<
  const Ar extends readonly unknown[] & UnknownBrand,
  const V,
>(
  array: Ar,
  value: V,
  fillRange: readonly [
    start: ArgArrayIndexWithNegative<Ar>,
    end: ArgArrayIndexWithNegative<Ar>,
  ],
): ChangeArrayElement<Ar, V | Ar[number]>;

// See `toFilled` for why the unbranded case states the homomorphic mapping
// directly instead of going through a conditional.
export function toRangeFilled<const Ar extends readonly unknown[], const V>(
  array: Ar,
  value: V,
  fillRange: readonly [
    start: ArgArrayIndexWithNegative<Ar>,
    end: ArgArrayIndexWithNegative<Ar>,
  ],
): Readonly<{ [K in keyof Ar]: V | Ar[number] }>;

// curried version
export function toRangeFilled<const V>(
  value: V,
  fillRange: readonly [
    start: SizeType.ArgArrWithNegative,
    end: SizeType.ArgArrWithNegative,
  ],
): (<const Ar extends readonly unknown[] & UnknownBrand>(
  array: Ar,
) => ChangeArrayElement<Ar, V | Ar[number]>) &
  (<const Ar extends readonly unknown[]>(
    array: Ar,
  ) => Readonly<{ [K in keyof Ar]: V | Ar[number] }>);

export function toRangeFilled<E, const V>(
  ...args:
    | readonly [
        array: readonly E[],
        value: V,
        fillRange: readonly [
          start: SizeType.ArgArrWithNegative,
          end: SizeType.ArgArrWithNegative,
        ],
      ]
    | readonly [
        value: V,
        fillRange: readonly [
          start: SizeType.ArgArrWithNegative,
          end: SizeType.ArgArrWithNegative,
        ],
      ]
): readonly (E | V)[] | ((array: readonly E[]) => readonly (E | V)[]) {
  switch (args.length) {
    case 3:
      return toRangeFilledImpl(...args);

    case 2:
      return (array) => toRangeFilledImpl(array, ...args);
  }
}

const toRangeFilledImpl = <E, const V>(
  array: readonly E[],
  value: V,
  fillRange: readonly [
    start: SizeType.ArgArrWithNegative,
    end: SizeType.ArgArrWithNegative,
  ],
): readonly (E | V)[] => {
  const [start, end] = fillRange;

  const mut_cp: (E | V)[] = castMutable(copy(array));

  mut_cp.fill(value, start, end);

  return mut_cp;
};

/**
 * The result of replacing the element at `I` of `Ar` with a `V`.
 *
 * `ConstrainedList.SetAt` replaces exactly one position when the index pins
 * one, which is what makes `Arr.set(xs, 1, v)` report `readonly [a, V, c]`
 * instead of widening every position to `a | V`.
 *
 * A union index needs the weaker answer, and this used to guard for it here:
 * `ArgArrayIndex<Ar>` for a tuple is the union of its indices, so
 * `Arr.set(tuple, someIndex, v)` with `someIndex: 0 | 2` binds `I = 0 | 2`, and
 * the upstream `List.SetAt` used to answer `readonly [V, b, V]` — a type that
 * *neither* possible runtime result satisfies, since the call replaces one
 * position or the other and never both.
 *
 * ts-type-forge 9.1.1 fixes that at the source and widens the candidate
 * positions itself, so the guard is gone. Upstream is the more precise of the
 * two: it widens only the positions the index can name, where the guard here
 * widened all of them — `Arr.set(t, i, 'x')` with `i: 0 | 2` on
 * `readonly [1, 2, 3]` now keeps the middle element at `2` rather than
 * reporting `2 | 'x'`.
 */
type ReplacedAt<
  Ar extends readonly unknown[],
  I extends number,
  V,
> = ConstrainedList.SetAt<I, V, Ar>;
