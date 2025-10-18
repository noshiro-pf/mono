import { asPositiveUint32 } from '../../number/index.mjs';
import { castMutable } from '../../others/index.mjs';
import { copy, create } from './array-utils-creation.mjs';

/**
 * Returns a new array with an element at the specified index replaced.
 *
 * @example
 *
 * ```ts
 * const scores: number[] = [10, 20, 30];
 *
 * const updated = Arr.set(scores, 1, 25);
 *
 * assert.deepStrictEqual(updated, [10, 25, 30]);
 * ```
 */
export function set<const Ar extends readonly unknown[], const V = Ar[number]>(
  array: Ar,
  index: ArgArrayIndex<Ar>,
  newValue: V,
): IsFixedLengthList<Ar> extends true
  ? Readonly<{ [K in keyof Ar]: Ar[K] | V }>
  : Ar extends NonEmptyArray<unknown>
    ? NonEmptyArray<Ar[number] | V>
    : readonly (Ar[number] | V)[];

// curried version
export function set<const V>(
  index: SizeType.ArgArr,
  newValue: V,
): <const Ar extends readonly unknown[]>(
  array: Ar,
) => IsFixedLengthList<Ar> extends true
  ? Readonly<{ [K in keyof Ar]: Ar[K] | V }>
  : Ar extends NonEmptyArray<unknown>
    ? NonEmptyArray<Ar[number] | V>
    : readonly (Ar[number] | V)[];

export function set<E, const V = E>(
  ...args:
    | readonly [array: readonly E[], index: SizeType.ArgArr, newValue: V]
    | readonly [index: SizeType.ArgArr, newValue: V]
): readonly (E | V)[] | ((array: readonly E[]) => readonly (E | V)[]) {
  switch (args.length) {
    case 3: {
      const [array, index, newValue] = args;
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return (array as (E | V)[]).with(index, newValue);
    }
    case 2: {
      const [index, newValue] = args;
      return (array) => set(array, index, newValue);
    }
  }
}

/**
 * Returns a new array with an element at the specified index updated by applying a function.
 *
 * @example
 *
 * ```ts
 * const temperatures: number[] = [20, 21, 22];
 *
 * const increased = Arr.toUpdated(temperatures, 1, (value) => value + 5);
 * const incrementLast = Arr.toUpdated<number>(
 *   2,
 *   (value) => value + 1,
 * )(temperatures);
 *
 * assert.deepStrictEqual(increased, [20, 26, 22]);
 * assert.deepStrictEqual(incrementLast, [20, 21, 23]);
 * ```
 */
export function toUpdated<
  const Ar extends readonly unknown[],
  const V = Ar[number],
>(
  array: Ar,
  index: ArgArrayIndex<Ar>,
  updater: (prev: Ar[number]) => V,
): IsFixedLengthList<Ar> extends true
  ? Readonly<{ [K in keyof Ar]: Ar[K] | V }>
  : Ar extends NonEmptyArray<unknown>
    ? NonEmptyArray<Ar[number] | V>
    : readonly (Ar[number] | V)[];

// curried version
export function toUpdated<E, const V = E>(
  index: SizeType.ArgArr,
  updater: (prev: E) => V,
): <const Ar extends readonly E[]>(
  array: Ar,
) => IsFixedLengthList<Ar> extends true
  ? Readonly<{ [K in keyof Ar]: Ar[K] | V }>
  : Ar extends NonEmptyArray<unknown>
    ? NonEmptyArray<Ar[number] | V>
    : readonly (Ar[number] | V)[];

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
    case 3: {
      const [array, index, updater] = args;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, total-functions/no-unsafe-type-assertion
      return (array as (E | V)[]).with(index, updater(array[index]!));
    }
    case 2: {
      const [index, updater] = args;
      return (array) => toUpdated(array, index, updater);
    }
  }
}

/**
 * Returns a new array with a value inserted at the specified index.
 *
 * @example
 *
 * ```ts
 * const numbers = [1, 2, 4] as const;
 *
 * const withThree = Arr.toInserted(numbers, 2, 3);
 * const appendFive = Arr.toInserted(3, 5)(numbers);
 *
 * assert.deepStrictEqual(withThree, [1, 2, 3, 4]);
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
  ? ArrayOfLength<CastToNumber<Increment<Ar['length']>>, Ar[number] | V>
  : NonEmptyArray<Ar[number] | V>;

// curried version
export function toInserted<const V>(
  index: SizeType.ArgArrWithNegative,
  newValue: V,
): <const Ar extends readonly unknown[]>(
  array: Ar,
) => IsFixedLengthList<Ar> extends true
  ? ArrayOfLength<CastToNumber<Increment<Ar['length']>>, Ar[number] | V>
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
    case 3: {
      const [array, index, newValue] = args;
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return (array as readonly (E | V)[]).toSpliced(
        index,
        0,
        newValue,
      ) as unknown as NonEmptyArray<E | V>;
    }
    case 2: {
      const [index, newValue] = args;
      return (array) => toInserted(array, index, newValue);
    }
  }
}

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
 * const withoutFirstCurried = Arr.toRemoved(0)(letters);
 *
 * assert.deepStrictEqual(withoutSecond, ['a', 'c', 'd']);
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
    case 2: {
      const [array, index] = args;
      return array.toSpliced(index, 1);
    }
    case 1: {
      const [index] = args;
      return (array) => toRemoved(array, index);
    }
  }
}

/**
 * Returns a new array with a value appended to the end.
 *
 * @example
 *
 * ```ts
 * const base = [1, 2] as const;
 *
 * const appended = Arr.toPushed(base, 3);
 * const appendedCurried = Arr.toPushed(4)(base);
 *
 * assert.deepStrictEqual(appended, [1, 2, 3]);
 * assert.deepStrictEqual(appendedCurried, [1, 2, 4]);
 * ```
 */
export function toPushed<const Ar extends readonly unknown[], const V>(
  array: Ar,
  newValue: V,
): readonly [...Ar, V];

export function toPushed<const V>(
  newValue: V,
): <const Ar extends readonly unknown[]>(array: Ar) => readonly [...Ar, V];

export function toPushed<const Ar extends readonly unknown[], const V>(
  ...args: readonly [array: Ar, newValue: V] | readonly [newValue: V]
): readonly [...Ar, V] | ((array: Ar) => readonly [...Ar, V]) {
  switch (args.length) {
    case 2: {
      const [array, newValue] = args;
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return array.toSpliced(array.length, 0, newValue) as unknown as readonly [
        ...Ar,
        V,
      ];
    }
    case 1: {
      const [newValue] = args;
      return (array) => toPushed(array, newValue);
    }
  }
}

/**
 * Returns a new array with a value prepended to the beginning.
 *
 * @example
 *
 * ```ts
 * const base = [2, 3] as const;
 *
 * const prefixed = Arr.toUnshifted(base, 1);
 * const prefixedCurried = Arr.toUnshifted(0)(base);
 *
 * assert.deepStrictEqual(prefixed, [1, 2, 3]);
 * assert.deepStrictEqual(prefixedCurried, [0, 2, 3]);
 * ```
 */
export function toUnshifted<const Ar extends readonly unknown[], const V>(
  array: Ar,
  newValue: V,
): readonly [V, ...Ar];

export function toUnshifted<const V>(
  newValue: V,
): <const Ar extends readonly unknown[]>(array: Ar) => readonly [V, ...Ar];

export function toUnshifted<Ar extends readonly unknown[], const V>(
  ...args: readonly [array: Ar, newValue: V] | readonly [newValue: V]
): readonly [V, ...Ar] | ((array: Ar) => readonly [V, ...Ar]) {
  switch (args.length) {
    case 2: {
      const [array, newValue] = args;
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return array.toSpliced(0, 0, newValue) as unknown as readonly [V, ...Ar];
    }
    case 1: {
      const [newValue] = args;
      return (array) => toUnshifted(array, newValue);
    }
  }
}

/**
 * Returns a new array with all elements replaced by the specified value.
 *
 * @example
 *
 * ```ts
 * const base = [1, 2, 3];
 *
 * const filled = Arr.toFilled(base, 0);
 * const filledCurried = Arr.toFilled('x')(base);
 *
 * assert.deepStrictEqual(filled, [0, 0, 0]);
 * assert.deepStrictEqual(filledCurried, ['x', 'x', 'x']);
 * ```
 */
export function toFilled<const Ar extends readonly unknown[], const V>(
  array: Ar,
  value: V,
): IsFixedLengthList<Ar> extends true
  ? ArrayOfLength<Ar['length'], V>
  : Ar extends NonEmptyArray<unknown>
    ? NonEmptyArray<V>
    : readonly V[];

// curried version
export function toFilled<const V>(
  value: V,
): <const Ar extends readonly unknown[]>(
  array: Ar,
) => IsFixedLengthList<Ar> extends true
  ? ArrayOfLength<Ar['length'], V>
  : Ar extends NonEmptyArray<unknown>
    ? NonEmptyArray<V>
    : readonly V[];

export function toFilled<E>(
  ...args: readonly [array: readonly E[], value: E] | readonly [value: E]
): readonly E[] | ((array: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2: {
      const [array, value] = args;
      return create(asPositiveUint32(array.length), value);
    }
    case 1: {
      const [value] = args;
      return (array) => toFilled(array, value);
    }
  }
}

/**
 * Returns a new array with elements in the specified range replaced by the specified value.
 *
 * @example
 *
 * ```ts
 * const base = [0, 1, 2, 3, 4];
 *
 * const filledMiddle = Arr.toRangeFilled(base, 9, [1, 4]);
 * const filledPrefix = Arr.toRangeFilled(8, [0, 2])(base);
 *
 * assert.deepStrictEqual(filledMiddle, [0, 9, 9, 9, 4]);
 * assert.deepStrictEqual(filledPrefix, [8, 8, 2, 3, 4]);
 * ```
 */
export function toRangeFilled<const Ar extends readonly unknown[], const V>(
  array: Ar,
  value: V,
  fillRange: readonly [
    start: ArgArrayIndexWithNegative<Ar>,
    end: ArgArrayIndexWithNegative<Ar>,
  ],
): IsFixedLengthList<Ar> extends true
  ? ArrayOfLength<Ar['length'], V | Ar[number]>
  : Ar extends NonEmptyArray<unknown>
    ? NonEmptyArray<V | Ar[number]>
    : readonly (V | Ar[number])[];

// curried version
export function toRangeFilled<const V>(
  value: V,
  fillRange: readonly [
    start: SizeType.ArgArrWithNegative,
    end: SizeType.ArgArrWithNegative,
  ],
): <const Ar extends readonly unknown[]>(
  array: Ar,
) => IsFixedLengthList<Ar> extends true
  ? ArrayOfLength<Ar['length'], V | Ar[number]>
  : Ar extends NonEmptyArray<unknown>
    ? NonEmptyArray<V | Ar[number]>
    : readonly (V | Ar[number])[];

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
    case 3: {
      const [array, value, [start, end]] = args;
      const mut_cp: (E | V)[] = castMutable(copy(array));
      mut_cp.fill(value, start, end);
      return mut_cp;
    }
    case 2: {
      const [value, fillRange] = args;
      return (array) => toRangeFilled(array, value, fillRange);
    }
  }
}
