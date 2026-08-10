import {
  type BoundedLengthTuple,
  type FixedLengthTuple,
  type MaxLengthTuple,
  type MinLengthTuple,
} from 'ts-type-forge';
import { type SizeType } from '../../types.mjs';

/**
 * Type guard that checks if an array is empty, narrowing it to the structural
 * empty tuple.
 *
 * This is the structural counterpart of `isEmpty`: it narrows to `readonly []`
 * rather than to the branded `FixedLengthArray<0, E>`. Prefer `isEmpty` unless
 * you specifically need the structural type.
 *
 * @example
 *
 * ```ts
 * const values: readonly number[] = [] as const;
 *
 * assert.isTrue(Arr.isEmptyTuple(values));
 *
 * assert.isFalse(Arr.isEmptyTuple([1] as const));
 * ```
 *
 * @template E - The element type.
 * @param array - The array to check.
 * @returns `true` if `array.length === 0`. When `true`, TypeScript narrows
 *   `array` to `readonly []`.
 */
export const isEmptyTuple = <E,>(array: readonly E[]): array is readonly [] =>
  array.length === 0;

/**
 * Type guard that checks if an array is non-empty, narrowing it to the
 * structural non-empty tuple.
 *
 * This is the structural counterpart of `isNonEmpty`: it narrows to
 * `MinLengthTuple<1, E>` rather than to the branded `MinLengthArray<1, E>`.
 * Prefer `isNonEmpty` unless you specifically need the structural type.
 *
 * @example
 *
 * ```ts
 * const values: readonly number[] = [1, 2] as const;
 *
 * assert.isTrue(Arr.isNonEmptyTuple(values));
 *
 * assert.isFalse(Arr.isNonEmptyTuple([] as const));
 * ```
 *
 * @template E - The element type.
 * @param array - The array to check.
 * @returns `true` if `array.length >= 1`. When `true`, TypeScript narrows
 *   `array` to `MinLengthTuple<1, E>`.
 */
export const isNonEmptyTuple = <E,>(
  array: readonly E[],
): array is MinLengthTuple<1, E> => array.length >= 1;

/**
 * Checks if an array has a specific length.
 *
 * @example
 *
 * ```ts
 * const pair: readonly number[] = [1, 2] as const;
 *
 * const triple: readonly number[] = [1, 2, 3] as const;
 *
 * assert.isTrue(Arr.isFixedLengthTuple(2, pair));
 *
 * assert.isFalse(Arr.isFixedLengthTuple(2, triple));
 *
 * if (Arr.isFixedLengthTuple(2, pair)) {
 *   assert.deepStrictEqual(pair, [1, 2]);
 * }
 * ```
 */
export function isFixedLengthTuple<N extends SizeType.ArgArr, E>(
  len: N,
  array: readonly E[],
): array is FixedLengthTuple<N, E>;

// Curried version
export function isFixedLengthTuple<N extends SizeType.ArgArr>(
  len: N,
): <E>(array: readonly E[]) => array is FixedLengthTuple<N, E>;

export function isFixedLengthTuple(
  ...args:
    | readonly [len: SizeType.ArgArr, array: readonly unknown[]]
    | readonly [len: SizeType.ArgArr]
): boolean | ((array: readonly unknown[]) => boolean) {
  switch (args.length) {
    case 2:
      return hasFixedLength(args[0], args[1]);

    case 1:
      return (array) => hasFixedLength(args[0], array);
  }
}

const hasFixedLength = (
  len: SizeType.ArgArr,
  array: readonly unknown[],
): boolean => array.length === len;

/**
 * Checks if an array has at least a specific length.
 *
 * @example
 *
 * ```ts
 * const queue: readonly string[] = ['task-1', 'task-2'] as const;
 *
 * const emptyQueue: readonly string[] = [] as const;
 *
 * assert.isTrue(Arr.isMinLengthTuple(1, queue));
 *
 * assert.isFalse(Arr.isMinLengthTuple(1, emptyQueue));
 *
 * if (Arr.isMinLengthTuple(1, queue)) {
 *   assert.isTrue(queue[0] === 'task-1');
 * }
 * ```
 */
export function isMinLengthTuple<N extends SizeType.ArgArr, E>(
  len: N,
  array: readonly E[],
): array is MinLengthTuple<N, E>;

// Curried version
export function isMinLengthTuple<N extends SizeType.ArgArr>(
  len: N,
): <E>(array: readonly E[]) => array is MinLengthTuple<N, E>;

export function isMinLengthTuple(
  ...args:
    | readonly [len: SizeType.ArgArr, array: readonly unknown[]]
    | readonly [len: SizeType.ArgArr]
): boolean | ((array: readonly unknown[]) => boolean) {
  switch (args.length) {
    case 2:
      return hasMinLength(args[0], args[1]);

    case 1:
      return (array) => hasMinLength(args[0], array);
  }
}

const hasMinLength = (
  len: SizeType.ArgArr,
  array: readonly unknown[],
): boolean => array.length >= len;

/**
 * Checks if an array has at most a specific length.
 *
 * @example
 *
 * ```ts
 * const pair: readonly number[] = [1, 2] as const;
 *
 * const triple: readonly number[] = [1, 2, 3] as const;
 *
 * assert.isTrue(Arr.isMaxLengthTuple(2, pair));
 *
 * assert.isFalse(Arr.isMaxLengthTuple(2, triple));
 *
 * if (Arr.isMaxLengthTuple(2, pair)) {
 *   assert.isTrue(pair.length <= 2);
 * }
 * ```
 */
export function isMaxLengthTuple<N extends SizeType.ArgArr, E>(
  len: N,
  array: readonly E[],
): array is MaxLengthTuple<N, E>;

// Curried version
export function isMaxLengthTuple<N extends SizeType.ArgArr>(
  len: N,
): <E>(array: readonly E[]) => array is MaxLengthTuple<N, E>;

export function isMaxLengthTuple(
  ...args:
    | readonly [len: SizeType.ArgArr, array: readonly unknown[]]
    | readonly [len: SizeType.ArgArr]
): boolean | ((array: readonly unknown[]) => boolean) {
  switch (args.length) {
    case 2:
      return hasMaxLength(args[0], args[1]);

    case 1:
      return (array) => hasMaxLength(args[0], array);
  }
}

const hasMaxLength = (
  len: SizeType.ArgArr,
  array: readonly unknown[],
): boolean => array.length <= len;

/**
 * Checks if an array's length is within a specific inclusive range.
 *
 * @example
 *
 * ```ts
 * const pair: readonly number[] = [1, 2] as const;
 *
 * const quad: readonly number[] = [1, 2, 3, 4] as const;
 *
 * assert.isTrue(Arr.isBoundedLengthTuple(1, 3, pair));
 *
 * assert.isFalse(Arr.isBoundedLengthTuple(1, 3, quad));
 *
 * if (Arr.isBoundedLengthTuple(1, 3, pair)) {
 *   assert.isTrue(pair.length >= 1 && pair.length <= 3);
 * }
 * ```
 */
export function isBoundedLengthTuple<
  Min extends SizeType.ArgArr,
  Max extends SizeType.ArgArr,
  E,
>(
  min: Min,
  max: Max,
  array: readonly E[],
): array is BoundedLengthTuple<Min, Max, E>;

// Curried version
export function isBoundedLengthTuple<
  Min extends SizeType.ArgArr,
  Max extends SizeType.ArgArr,
>(
  min: Min,
  max: Max,
): <E>(array: readonly E[]) => array is BoundedLengthTuple<Min, Max, E>;

export function isBoundedLengthTuple(
  ...args:
    | readonly [
        min: SizeType.ArgArr,
        max: SizeType.ArgArr,
        array: readonly unknown[],
      ]
    | readonly [min: SizeType.ArgArr, max: SizeType.ArgArr]
): boolean | ((array: readonly unknown[]) => boolean) {
  switch (args.length) {
    case 3:
      return isWithinBounds(args[0], args[1], args[2]);

    case 2:
      return (array) => isWithinBounds(args[0], args[1], array);
  }
}

const isWithinBounds = (
  min: SizeType.ArgArr,
  max: SizeType.ArgArr,
  array: readonly unknown[],
): boolean => array.length >= min && array.length <= max;
