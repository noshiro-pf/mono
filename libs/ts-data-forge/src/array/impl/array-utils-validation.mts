import {
  type BoolOr,
  type ChangeArrayElement,
  type IsAny,
  type IsUnknown,
  type UnknownBrand,
} from 'ts-type-forge';
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
// Type guard overloads - narrow the entire array type.
//
// Both narrowed types are intersected with `Ar`: a type predicate's type has
// to be assignable to the parameter's type, and neither the deferred
// conditional `ChangeArrayElement<Ar, S>` nor the mapped type over a generic
// `Ar` is (TS2677). The intersection also keeps whatever the caller already
// knew about the array — a branded five-tuple stays a five-tuple.
export function every<
  const Ar extends readonly unknown[] & UnknownBrand,
  S extends Ar[number],
>(
  array: Ar,
  predicate: (a: Ar[number], index: ArrayIndex<Ar>) => a is S,
): array is ChangeArrayElement<Ar, S> & Ar;

// A plain array or tuple carries no length brand, so the homomorphic mapping
// is the whole answer — same reasoning as in `map`.
export function every<
  const Ar extends readonly unknown[],
  S extends Ar[number],
>(
  array: Ar,
  predicate: (a: Ar[number], index: ArrayIndex<Ar>) => a is S,
): array is Readonly<{ [K in keyof Ar]: S }> & Ar;

// Regular boolean predicate overloads
export function every<const Ar extends readonly unknown[]>(
  array: Ar,
  predicate: (a: Ar[number], index: ArrayIndex<Ar>) => boolean,
): boolean;

// curried version
//
// As in `map`, the branded and the plain case have to be overloads *of the
// returned function*, not two overloads of `every` itself: both curried
// signatures take the same single predicate, so overload resolution would
// always pick the first and the second would be dead — which is what left a
// plain `readonly unknown[]` unable to satisfy the `UnknownBrand` constraint
// at the call site of the returned guard.
//
// The intersection is also what keeps the group compatible with the
// implementation signature. A lone `<Ar extends readonly E[] & UnknownBrand>`
// signature is not something `(array: readonly E[]) => boolean` can implement
// (TS2394); the unbranded member of the intersection is, and one matching
// member is enough.
export function every<E, S extends E>(
  predicate: (a: E, index: SizeType.Arr) => a is S,
): (<const Ar extends readonly E[] & UnknownBrand>(
  array: Ar,
) => array is ChangeArrayElement<Ar, S> & Ar) &
  (<const Ar extends readonly E[]>(
    array: Ar,
  ) => array is Readonly<{ [K in keyof Ar]: S }> & Ar);

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
