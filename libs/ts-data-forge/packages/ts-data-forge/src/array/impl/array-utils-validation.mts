import { type BoolOr, type IsAny, type IsUnknown } from 'ts-type-forge';
import { asUint32, Num } from '../../number/index.mjs';
import { type ArrayIndex, type SizeType } from '../../types.mjs';

/**
 * Type guard that checks if a value is an array.
 *
 * @example
 *
 * ```ts
 * const maybeArray: unknown = [1, 2, 3] as const;
 *
 * const maybeValue: unknown = 'Ada';
 *
 * assert.isTrue(Arr.isArray(maybeArray));
 *
 * assert.isFalse(Arr.isArray(maybeValue));
 *
 * if (Arr.isArray(maybeArray)) {
 *   assert.deepStrictEqual(maybeArray, [1, 2, 3]);
 * }
 * ```
 */
export const isArray = <E,>(value: E): value is FilterArray<E> =>
  Array.isArray(value);

type FilterArray<T> = T extends T
  ? BoolOr<IsUnknown<T>, IsAny<T>> extends true
    ? Cast<readonly unknown[], T>
    : T extends readonly unknown[]
      ? T
      : never // Exclude non-array types
  : never;

type Cast<A, B> = A extends B ? A : never;

// validation

/**
 * Tests whether all elements in an array pass a test implemented by a predicate.
 *
 * @example
 *
 * ```ts
 * const numbers = [2, 4, 6] as const;
 *
 * const words = ['Ada', 'Grace'] as const;
 *
 * const allEven = Arr.every(numbers, (value) => value % 2 === 0);
 *
 * const allStartWithA = Arr.every(words, (value) => value.startsWith('A'));
 *
 * assert.isTrue(allEven);
 *
 * assert.isFalse(allStartWithA);
 * ```
 */
// Type guard overloads - narrow the entire array type
export function every<E, S extends E>(
  array: readonly E[],
  predicate: (a: E, index: SizeType.Arr) => a is S,
): array is readonly S[];

export function every<E, S extends E>(
  predicate: (a: E, index: SizeType.Arr) => a is S,
): (array: readonly E[]) => array is readonly S[];

// Regular boolean predicate overloads
export function every<const Ar extends readonly unknown[]>(
  array: Ar,
  predicate: (a: Ar[number], index: ArrayIndex<Ar>) => boolean,
): boolean;

export function every<E>(
  predicate: (a: E, index: SizeType.Arr) => boolean,
): (array: readonly E[]) => boolean;

export function every<E>(
  ...args:
    | readonly [
        array: readonly E[],
        predicate: (a: E, index: SizeType.Arr) => boolean,
      ]
    | readonly [predicate: (a: E, index: SizeType.Arr) => boolean]
): boolean | ((array: readonly E[]) => boolean) {
  switch (args.length) {
    case 2:
      return everyImpl(...args);

    case 1:
      return (array) => everyImpl(array, ...args);
  }
}

const everyImpl = <E,>(
  array: readonly E[],
  predicate: (a: E, index: SizeType.Arr) => boolean,
): boolean => array.every((a, i) => predicate(a, asUint32(i)));

/**
 * Tests whether at least one element in an array passes a test implemented by a predicate.
 *
 * @example
 *
 * ```ts
 * const numbers = [1, 3, 5] as const;
 *
 * const words = ['Ada', 'Grace'] as const;
 *
 * const hasEven = Arr.some(numbers, (value) => value % 2 === 0);
 *
 * const hasShortName = Arr.some(words, (value) => value.length <= 3);
 *
 * assert.isFalse(hasEven);
 *
 * assert.isTrue(hasShortName);
 * ```
 */
export function some<const Ar extends readonly unknown[]>(
  array: Ar,
  predicate: (a: Ar[number], index: ArrayIndex<Ar>) => boolean,
): boolean;

export function some<E>(
  predicate: (a: E, index: SizeType.Arr) => boolean,
): (array: readonly E[]) => boolean;

export function some<E>(
  ...args:
    | readonly [
        array: readonly E[],
        predicate: (a: E, index: SizeType.Arr) => boolean,
      ]
    | readonly [predicate: (a: E, index: SizeType.Arr) => boolean]
): boolean | ((array: readonly E[]) => boolean) {
  switch (args.length) {
    case 2:
      return someImpl(...args);

    case 1:
      return (array) => someImpl(array, ...args);
  }
}

const someImpl = <E,>(
  array: readonly E[],
  predicate: (a: E, index: SizeType.Arr) => boolean,
): boolean => array.some((a, i) => predicate(a, asUint32(i)));

/**
 * Checks if an index is within the valid range of an array.
 *
 * @example
 *
 * ```ts
 * const items = ['Ada', 'Grace', 'Katherine'] as const;
 *
 * assert.isTrue(Arr.indexIsInRange(items, 1));
 *
 * assert.isFalse(Arr.indexIsInRange(items, 3));
 *
 * if (Arr.indexIsInRange(items, 2)) {
 *   assert.isTrue(items[2] === 'Katherine');
 * }
 * ```
 */
export const indexIsInRange = <E,>(
  array: readonly E[],
  index: SizeType.ArgArr,
): boolean => Num.isInRange(0, array.length)(index);
