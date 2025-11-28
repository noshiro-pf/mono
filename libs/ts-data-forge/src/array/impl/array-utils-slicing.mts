import { Uint32 } from '../../number/index.mjs';
import { size } from './array-utils-size.mjs';
import { sliceClamped } from './array-utils-slice-clamped.mjs';
import { isEmpty } from './array-utils-validation.mjs';

/**
 * Returns all elements of an array except the first one.
 *
 * @example
 *
 * ```ts
 * {
 *   const scientists = ['Ada', 'Grace', 'Katherine'] as const;
 *
 *   const remainder = Arr.tail(scientists);
 *
 *   assert.deepStrictEqual(remainder, ['Grace', 'Katherine']);
 *
 *   assert.isTrue(remainder.length === 2);
 * }
 *
 * {
 *   const values = [1, 2, 3] as const;
 *
 *   const remainder = Arr.rest(values);
 *
 *   const emptyRemainder = Arr.rest([1] as const);
 *
 *   assert.deepStrictEqual(remainder, [2, 3] as const);
 *
 *   assert.deepStrictEqual(emptyRemainder, [] as const);
 * }
 * ```
 */
export const tail = <const Ar extends readonly unknown[]>(
  array: Ar,
): List.Tail<Ar> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  array.slice(1) as unknown as List.Tail<Ar>;

/**
 * Returns all elements of an array except the last one.
 *
 * @example
 *
 * ```ts
 * const queue = ['task-1', 'task-2', 'task-3'] as const;
 *
 * const withoutLast = Arr.butLast(queue);
 *
 * assert.deepStrictEqual(withoutLast, ['task-1', 'task-2']);
 *
 * assert.isTrue(withoutLast.length === 2);
 * ```
 */
export const butLast = <const Ar extends readonly unknown[]>(
  array: Ar,
): List.ButLast<Ar> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  (isEmpty(array) ? [] : array.slice(0, -1)) as unknown as List.ButLast<Ar>;

/**
 * Takes the first N elements from an array.
 *
 * @example
 *
 * ```ts
 * const values = [1, 2, 3, 4];
 *
 * const firstTwo = Arr.take(values, 2);
 *
 * const firstThree = Arr.take(3)(values);
 *
 * assert.deepStrictEqual(firstTwo, [1, 2]);
 *
 * assert.deepStrictEqual(firstThree, [1, 2, 3]);
 * ```
 */
export function take<
  const Ar extends readonly unknown[],
  N extends SizeType.ArgArr,
>(
  array: Ar,
  num: N,
): N extends SmallUint
  ? List.Take<N, Ar>
  : N extends SizeType.ArgArrPositive
    ? Ar extends NonEmptyArray<unknown>
      ? NonEmptyArray<Ar[number]>
      : readonly Ar[number][]
    : readonly Ar[number][];

export function take<N extends SizeType.ArgArr>(
  num: N,
): <const Ar extends readonly unknown[]>(
  array: Ar,
) => N extends SmallUint
  ? List.Take<N, Ar>
  : N extends SizeType.ArgArrPositive
    ? Ar extends NonEmptyArray<unknown>
      ? NonEmptyArray<Ar[number]>
      : readonly Ar[number][]
    : readonly Ar[number][];

export function take<E>(
  ...args:
    | readonly [array: readonly E[], num: SizeType.ArgArr]
    | readonly [num: SizeType.ArgArr]
): readonly E[] | ((array: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2: {
      const [array, num] = args;

      return sliceClamped(array, 0, num);
    }

    case 1: {
      const [num] = args;

      return (array) => take(array, num);
    }
  }
}

/**
 * Takes the last N elements from an array.
 *
 * @example
 *
 * ```ts
 * const values = [1, 2, 3, 4];
 *
 * const lastTwo = Arr.takeLast(values, 2);
 *
 * const lastThree = Arr.takeLast(3)(values);
 *
 * assert.deepStrictEqual(lastTwo, [3, 4]);
 *
 * assert.deepStrictEqual(lastThree, [2, 3, 4]);
 * ```
 */
export function takeLast<
  const Ar extends readonly unknown[],
  N extends SizeType.ArgArr,
>(
  array: Ar,
  num: N,
): N extends SmallUint
  ? List.TakeLast<N, Ar>
  : N extends SizeType.ArgArrPositive
    ? Ar extends NonEmptyArray<unknown>
      ? NonEmptyArray<Ar[number]>
      : readonly Ar[number][]
    : readonly Ar[number][];

export function takeLast<N extends SizeType.ArgArr>(
  num: N,
): <const Ar extends readonly unknown[]>(
  array: Ar,
) => N extends SmallUint
  ? List.TakeLast<N, Ar>
  : N extends SizeType.ArgArrPositive
    ? Ar extends NonEmptyArray<unknown>
      ? NonEmptyArray<Ar[number]>
      : readonly Ar[number][]
    : readonly Ar[number][];

export function takeLast<E>(
  ...args:
    | readonly [array: readonly E[], num: SizeType.ArgArr]
    | readonly [num: SizeType.ArgArr]
): readonly E[] | ((array: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2: {
      const [array, num] = args;

      return sliceClamped(array, Uint32.sub(size(array), num), size(array));
    }

    case 1: {
      const [num] = args;

      return (array) => takeLast(array, num);
    }
  }
}

/**
 * Skips the first N elements of an array.
 *
 * @example
 *
 * ```ts
 * const values = ['a', 'b', 'c', 'd'] as const;
 *
 * const withoutFirstTwo = Arr.skip(values, 2);
 *
 * const withoutFirstThree = Arr.skip(3)(values);
 *
 * assert.deepStrictEqual(withoutFirstTwo, ['c', 'd']);
 *
 * assert.deepStrictEqual(withoutFirstThree, ['d']);
 * ```
 */
export function skip<
  const Ar extends readonly unknown[],
  N extends SizeType.ArgArr,
>(
  array: Ar,
  num: N,
): N extends SmallUint ? List.Skip<N, Ar> : readonly Ar[number][];

// curried version
export function skip<N extends SizeType.ArgArr>(
  num: N,
): <const Ar extends readonly unknown[]>(
  array: Ar,
) => N extends SmallUint ? List.Skip<N, Ar> : readonly Ar[number][];

export function skip<E>(
  ...args: readonly [readonly E[], SizeType.ArgArr] | readonly [SizeType.ArgArr]
): readonly E[] | ((array: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2: {
      const [array, num] = args;

      return sliceClamped(array, num, size(array));
    }

    case 1: {
      const [num] = args;

      return (array) => skip(array, num);
    }
  }
}

/**
 * Skips the last N elements of an array.
 *
 * @example
 *
 * ```ts
 * const values = ['a', 'b', 'c', 'd'];
 *
 * const withoutLastTwo = Arr.skipLast(values, 2);
 *
 * const withoutLastThree = Arr.skipLast(3)(values);
 *
 * assert.deepStrictEqual(withoutLastTwo, ['a', 'b']);
 *
 * assert.deepStrictEqual(withoutLastThree, ['a']);
 * ```
 */
export function skipLast<
  const Ar extends readonly unknown[],
  N extends SizeType.ArgArr,
>(
  array: Ar,
  num: N,
): N extends SmallUint ? List.SkipLast<N, Ar> : readonly Ar[number][];

// curried version
export function skipLast<N extends SizeType.ArgArr>(
  num: N,
): <const Ar extends readonly unknown[]>(
  array: Ar,
) => N extends SmallUint ? List.SkipLast<N, Ar> : readonly Ar[number][];

export function skipLast<E>(
  ...args:
    | readonly [array: readonly E[], num: SizeType.ArgArr]
    | readonly [num: SizeType.ArgArr]
): readonly E[] | ((array: readonly E[]) => readonly E[]) {
  switch (args.length) {
    case 2: {
      const [array, num] = args;

      return sliceClamped(array, 0, Uint32.sub(size(array), num));
    }

    case 1: {
      const [num] = args;

      return (array) => skipLast(array, num);
    }
  }
}

/**
 * Alias for `tail`.
 *
 * @see {@link tail}
 */
export const rest = tail;

/**
 * Alias for `skip`.
 *
 * @see {@link skip}
 */
export const drop = skip;
