import { asUint32, Num } from '../../number/index.mjs';

/**
 * Type guard that checks if a value is an array.
 *
 * @example
 *
 * ```ts
 * const maybeArray: unknown = [1, 2, 3];
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
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    BoolOr<TypeEq<T, unknown>, TypeEq<T, any>> extends true
    ? Cast<readonly unknown[], T>
    : T extends readonly unknown[]
      ? T
      : never // Exclude non-array types
  : never;

type Cast<A, B> = A extends B ? A : never;

// validation

/**
 * Type guard that checks if an array is empty.
 *
 * @example
 *
 * ```ts
 * const emptyNumbers: readonly number[] = [] as const;
 *
 * const words = ['Ada', 'Lovelace'] as const;
 *
 * assert.isTrue(Arr.isEmpty(emptyNumbers));
 *
 * assert.isFalse(Arr.isEmpty(words));
 *
 * if (Arr.isEmpty(emptyNumbers)) {
 *   assert.deepStrictEqual(emptyNumbers, []);
 * }
 * ```
 */
export const isEmpty = <E,>(array: readonly E[]): array is readonly [] =>
  array.length === 0;

/**
 * Type guard that checks if an array is non-empty.
 *
 * @example
 *
 * ```ts
 * const users: readonly Readonly<{ id: number }>[] = [{ id: 1 }];
 *
 * const emptyUsers: readonly Readonly<{ id: number }>[] = [];
 *
 * assert.isTrue(Arr.isNonEmpty(users));
 *
 * assert.isFalse(Arr.isNonEmpty(emptyUsers));
 *
 * if (Arr.isNonEmpty(users)) {
 *   assert.deepStrictEqual(users[0], { id: 1 });
 * }
 * ```
 */
export const isNonEmpty = <E,>(
  array: readonly E[],
): array is NonEmptyArray<E> => array.length > 0;

/**
 * Checks if an array has a specific length.
 *
 * @example
 *
 * ```ts
 * const pair: readonly number[] = [1, 2];
 *
 * const triple: readonly number[] = [1, 2, 3];
 *
 * assert.isTrue(Arr.isArrayOfLength(pair, 2));
 *
 * assert.isFalse(Arr.isArrayOfLength(triple, 2));
 *
 * if (Arr.isArrayOfLength(pair, 2)) {
 *   assert.deepStrictEqual(pair, [1, 2]);
 * }
 * ```
 */
export const isArrayOfLength = <E, N extends SizeType.ArgArr>(
  array: readonly E[],
  len: N,
): array is ArrayOfLength<N, E> => array.length === len;

/**
 * Checks if an array has at least a specific length.
 *
 * @example
 *
 * ```ts
 * const queue: readonly string[] = ['task-1', 'task-2'];
 *
 * const emptyQueue: readonly string[] = [];
 *
 * assert.isTrue(Arr.isArrayAtLeastLength(queue, 1));
 *
 * assert.isFalse(Arr.isArrayAtLeastLength(emptyQueue, 1));
 *
 * if (Arr.isArrayAtLeastLength(queue, 1)) {
 *   assert.isTrue(queue[0] === 'task-1');
 * }
 * ```
 */
export const isArrayAtLeastLength = <E, N extends SizeType.ArgArr>(
  array: readonly E[],
  len: N,
): array is ArrayAtLeastLen<N, E> => array.length >= len;

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
    case 2: {
      const [array, predicate] = args;

      return array.every((a, i) => predicate(a, asUint32(i)));
    }

    case 1: {
      const [predicate] = args;

      return (array) => every(array, predicate);
    }
  }
}

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
    case 2: {
      const [array, predicate] = args;

      return array.some((a, i) => predicate(a, asUint32(i)));
    }

    case 1: {
      const [predicate] = args;

      return (array) => some(array, predicate);
    }
  }
}

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
