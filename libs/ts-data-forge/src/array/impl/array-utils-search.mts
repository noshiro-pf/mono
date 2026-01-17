import { expectType } from '../../expect-type.mjs';
import { Optional, pipe } from '../../functional/index.mjs';
import { asUint32 } from '../../number/index.mjs';

/**
 * Finds the first element that satisfies a predicate.
 *
 * @example
 *
 * ```ts
 * const users = [
 *   { id: 1, name: 'Ada' },
 *   { id: 2, name: 'Grace' },
 * ];
 *
 * const found = Arr.find(users, (user) => user.id === 2);
 *
 * const missing = Arr.find<{ id: number }>((user) => user.id === 3)(users);
 *
 * assert.deepStrictEqual(found, Optional.some({ id: 2, name: 'Grace' }));
 *
 * assert.deepStrictEqual(missing, Optional.none);
 * ```
 */
export function find<E, F extends E>(
  array: readonly E[],
  predicate: (value: E, index: SizeType.Arr, arr: readonly E[]) => value is F,
): Optional<F>;

export function find<const Ar extends readonly unknown[]>(
  array: Ar,
  predicate: (value: Ar[number], index: ArrayIndex<Ar>, arr: Ar) => boolean,
): Optional<Ar[number]>;

export function find<E>(
  predicate: (value: E, index: SizeType.Arr, arr: readonly E[]) => boolean,
): (array: readonly E[]) => Optional<E>;

export function find<E>(
  ...args:
    | readonly [
        array: readonly E[],
        predicate: (
          value: E,
          index: SizeType.Arr,
          arr: readonly E[],
        ) => boolean,
      ]
    | readonly [
        predicate: (
          value: E,
          index: SizeType.Arr,
          arr: readonly E[],
        ) => boolean,
      ]
): Optional<E> | ((array: readonly E[]) => Optional<E>) {
  switch (args.length) {
    case 2: {
      const [array, predicate] = args;

      const foundIndex = array.findIndex(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        predicate as () => boolean,
      );

      expectType<
        Parameters<typeof array.findIndex>[0],
        (value: E, index: number, arr: readonly E[]) => unknown
      >('=');

      expectType<
        typeof predicate,
        (value: E, index: SizeType.Arr, arr: readonly E[]) => boolean
      >('=');

      return foundIndex === -1
        ? Optional.none
        : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Optional.some(array[foundIndex]!);
    }

    case 1: {
      const [predicate] = args;

      expectType<
        typeof predicate,
        (value: E, index: SizeType.Arr, arr: readonly E[]) => boolean
      >('=');

      return (array) => find(array, predicate);
    }
  }
}

/**
 * Finds the last element that satisfies a predicate.
 *
 * @example
 *
 * ```ts
 * const numbers = [1, 3, 2, 4, 5];
 *
 * const lastEven = Arr.findLast(numbers, (n) => n % 2 === 0);
 *
 * const none = Arr.findLast<number>((n) => n > 10)(numbers);
 *
 * assert.deepStrictEqual(lastEven, Optional.some(4));
 *
 * assert.deepStrictEqual(none, Optional.none);
 * ```
 */
export function findLast<E, F extends E>(
  array: readonly E[],
  predicate: (value: E, index: SizeType.Arr, arr: readonly E[]) => value is F,
): Optional<F>;

export function findLast<const Ar extends readonly unknown[]>(
  array: Ar,
  predicate: (value: Ar[number], index: ArrayIndex<Ar>, arr: Ar) => boolean,
): Optional<Ar[number]>;

export function findLast<E>(
  predicate: (value: E, index: SizeType.Arr, arr: readonly E[]) => boolean,
): (array: readonly E[]) => Optional<E>;

export function findLast<E>(
  ...args:
    | readonly [
        array: readonly E[],
        predicate: (
          value: E,
          index: SizeType.Arr,
          arr: readonly E[],
        ) => boolean,
      ]
    | readonly [
        predicate: (
          value: E,
          index: SizeType.Arr,
          arr: readonly E[],
        ) => boolean,
      ]
): Optional<E> | ((array: readonly E[]) => Optional<E>) {
  switch (args.length) {
    case 2: {
      const [array, predicate] = args;

      const foundIndex = array.findLastIndex(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        predicate as () => boolean,
      );

      expectType<
        Parameters<typeof array.findIndex>[0],
        (value: E, index: number, arr: readonly E[]) => unknown
      >('=');

      expectType<
        typeof predicate,
        (value: E, index: SizeType.Arr, arr: readonly E[]) => boolean
      >('=');

      return foundIndex === -1
        ? Optional.none
        : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          Optional.some(array[foundIndex]!);
    }

    case 1: {
      const [predicate] = args;

      expectType<
        typeof predicate,
        (value: E, index: SizeType.Arr, arr: readonly E[]) => boolean
      >('=');

      return (array) => findLast(array, predicate);
    }
  }
}

/**
 * Finds the index of the first element that satisfies a predicate.
 *
 * @example
 *
 * ```ts
 * const letters = ['a', 'b', 'c'];
 *
 * const indexOfB = Arr.findIndex(letters, (letter) => letter === 'b');
 *
 * // eslint-disable-next-line unicorn/prefer-array-index-of
 * const indexOfMissing = Arr.findIndex<string>((letter) => letter === 'z')(
 *   letters,
 * );
 *
 * assert.isTrue(indexOfB === 1);
 *
 * assert.isTrue(indexOfMissing === -1);
 * ```
 */
export function findIndex<const Ar extends readonly unknown[]>(
  array: Ar,
  predicate: (value: Ar[number], index: ArrayIndex<Ar>, arr: Ar) => boolean,
): ArrayIndex<Ar> | -1;

export function findIndex<E>(
  predicate: (value: E, index: SizeType.Arr, arr: readonly E[]) => boolean,
): (array: readonly E[]) => SizeType.Arr | -1;

export function findIndex<E>(
  ...args:
    | readonly [
        array: readonly E[],
        predicate: (
          value: E,
          index: SizeType.Arr,
          arr: readonly E[],
        ) => boolean,
      ]
    | readonly [
        predicate: (
          value: E,
          index: SizeType.Arr,
          arr: readonly E[],
        ) => boolean,
      ]
): SizeType.Arr | -1 | ((array: readonly E[]) => SizeType.Arr | -1) {
  switch (args.length) {
    case 2: {
      const [array, predicate] = args;

      return pipe(
        array.findIndex(
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          predicate as (value: E, index: number) => boolean,
        ),
      ).map((idx) => (idx >= 0 ? asUint32(idx) : -1)).value;
    }

    case 1: {
      const [predicate] = args;

      return (array) => findIndex(array, predicate);
    }
  }
}

/**
 * Finds the index of the last element that satisfies a predicate.
 *
 * @example
 *
 * ```ts
 * const letters = ['a', 'b', 'c', 'b'];
 *
 * const lastIndexOfB = Arr.findLastIndex(letters, (letter) => letter === 'b');
 *
 * // eslint-disable-next-line unicorn/prefer-array-index-of
 * const notFound = Arr.findLastIndex<string>((letter) => letter === 'z')(
 *   letters,
 * );
 *
 * assert.isTrue(lastIndexOfB === 3);
 *
 * assert.isTrue(notFound === -1);
 * ```
 */
export function findLastIndex<const Ar extends readonly unknown[]>(
  array: Ar,
  predicate: (value: Ar[number], index: ArrayIndex<Ar>, arr: Ar) => boolean,
): ArrayIndex<Ar> | -1;

export function findLastIndex<E>(
  predicate: (value: E, index: SizeType.Arr, arr: readonly E[]) => boolean,
): (array: readonly E[]) => SizeType.Arr | -1;

export function findLastIndex<E>(
  ...args:
    | readonly [
        array: readonly E[],
        predicate: (
          value: E,
          index: SizeType.Arr,
          arr: readonly E[],
        ) => boolean,
      ]
    | readonly [
        predicate: (
          value: E,
          index: SizeType.Arr,
          arr: readonly E[],
        ) => boolean,
      ]
): SizeType.Arr | -1 | ((array: readonly E[]) => SizeType.Arr | -1) {
  switch (args.length) {
    case 2: {
      const [array, predicate] = args;

      return pipe(
        array.findLastIndex(
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          predicate as (value: E, index: number) => boolean,
        ),
      ).map((idx) => (idx >= 0 ? asUint32(idx) : -1)).value;
    }

    case 1: {
      const [predicate] = args;

      return (array) => findLastIndex(array, predicate);
    }
  }
}

/**
 * Gets the index of a value in an array.
 *
 * @example
 *
 * ```ts
 * const fruits = ['apple', 'banana', 'orange', 'banana'];
 *
 * const indexOfBanana = Arr.indexOf(fruits, 'banana');
 *
 * const indexOfGrape = Arr.indexOf(fruits, 'grape');
 *
 * // Curried version
 * const findApple = Arr.indexOf('apple');
 *
 * const indexOfApple = findApple(fruits);
 *
 * console.log(indexOfBanana); // => 1
 *
 * console.log(indexOfGrape); // => -1
 *
 * console.log(indexOfApple); // => 0
 * ```
 */
export function indexOf<const Ar extends readonly unknown[]>(
  array: Ar,
  searchElement: Ar[number],
): ArrayIndex<Ar> | -1;

export function indexOf<E>(
  searchElement: E,
): (array: readonly E[]) => SizeType.Arr | -1;

export function indexOf<E>(
  ...args:
    | readonly [array: readonly E[], searchElement: E]
    | readonly [searchElement: E]
): SizeType.Arr | -1 | ((array: readonly E[]) => SizeType.Arr | -1) {
  switch (args.length) {
    case 2: {
      const [array, searchElement] = args;

      const index = array.indexOf(searchElement);

      return index !== -1 ? asUint32(index) : -1;
    }

    case 1: {
      const [searchElement] = args;

      return (array) => indexOf(array, searchElement);
    }
  }
}

/**
 * Gets the index of a value in an array, starting from a specified index.
 *
 * @example
 *
 * ```ts
 * const fruits = ['apple', 'banana', 'orange', 'banana'];
 *
 * // Search for 'banana' starting from index 1
 * const firstBanana = Arr.indexOfFrom(fruits, 'banana', 1);
 *
 * // Search for 'banana' starting from index 2
 * const secondBanana = Arr.indexOfFrom(fruits, 'banana', 2);
 *
 * // Element not found
 * const notFound = Arr.indexOfFrom(fruits, 'grape', 0);
 *
 * // Curried version
 * const findBananaFrom2 = Arr.indexOfFrom('banana', 2);
 *
 * const index = findBananaFrom2(fruits);
 *
 * console.log(firstBanana); // => 1
 *
 * console.log(secondBanana); // => 3
 *
 * console.log(notFound); // => -1
 *
 * console.log(index); // => 3
 * ```
 */
export function indexOfFrom<const Ar extends readonly unknown[]>(
  array: Ar,
  searchElement: Ar[number],
  fromIndex: ArgArrayIndexWithNegative<Ar>,
): ArrayIndex<Ar> | -1;

export function indexOfFrom<E>(
  searchElement: E,
  fromIndex: SizeType.ArgArrWithNegative,
): (array: readonly E[]) => SizeType.Arr | -1;

export function indexOfFrom<E>(
  ...args:
    | readonly [
        array: readonly E[],
        searchElement: E,
        fromIndex: SizeType.ArgArrWithNegative,
      ]
    | readonly [searchElement: E, fromIndex: SizeType.ArgArrWithNegative]
): SizeType.Arr | -1 | ((array: readonly E[]) => SizeType.Arr | -1) {
  switch (args.length) {
    case 3: {
      const [array, searchElement, fromIndex] = args;

      const index = array.indexOf(searchElement, fromIndex);

      return index !== -1 ? asUint32(index) : -1;
    }

    case 2: {
      const [searchElement, fromIndex] = args;

      return (array) => indexOfFrom(array, searchElement, fromIndex);
    }
  }
}

/**
 * Gets the last index of a value in an array.
 *
 * @example
 *
 * ```ts
 * const fruits = ['apple', 'banana', 'orange', 'banana'];
 *
 * const lastBanana = Arr.lastIndexOf(fruits, 'banana');
 *
 * const lastApple = Arr.lastIndexOf(fruits, 'apple');
 *
 * const notFound = Arr.lastIndexOf(fruits, 'grape');
 *
 * // Curried version
 * const findLastBanana = Arr.lastIndexOf('banana');
 *
 * const index = findLastBanana(fruits);
 *
 * console.log(lastBanana); // => 3
 *
 * console.log(lastApple); // => 0
 *
 * console.log(notFound); // => -1
 *
 * console.log(index); // => 3
 * ```
 */
export function lastIndexOf<const Ar extends readonly unknown[]>(
  array: Ar,
  searchElement: Ar[number],
): ArrayIndex<Ar> | -1;

export function lastIndexOf<E>(
  searchElement: E,
): (array: readonly E[]) => SizeType.Arr | -1;

export function lastIndexOf<E>(
  ...args:
    | readonly [array: readonly E[], searchElement: E]
    | readonly [searchElement: E]
): SizeType.Arr | -1 | ((array: readonly E[]) => SizeType.Arr | -1) {
  switch (args.length) {
    case 2: {
      const [array, searchElement] = args;

      const index = array.lastIndexOf(searchElement);

      return index !== -1 ? asUint32(index) : -1;
    }

    case 1: {
      const [searchElement] = args;

      return (array) => lastIndexOf(array, searchElement);
    }
  }
}

/**
 * Gets the last index of a value in an array, starting from a specified index.
 *
 * @example
 *
 * ```ts
 * const fruits = ['apple', 'banana', 'orange', 'banana', 'grape'];
 *
 * // Search backwards for 'banana' from index 3
 * const lastBananaFrom3 = Arr.lastIndexOfFrom(fruits, 'banana', 3);
 *
 * // Search backwards for 'banana' from index 2
 * const lastBananaFrom2 = Arr.lastIndexOfFrom(fruits, 'banana', 2);
 *
 * // Element not found
 * const notFound = Arr.lastIndexOfFrom(fruits, 'grape', 2);
 *
 * // Curried version
 * const findBananaFrom3 = Arr.lastIndexOfFrom('banana', 3);
 *
 * const index = findBananaFrom3(fruits);
 *
 * console.log(lastBananaFrom3); // => 3
 *
 * console.log(lastBananaFrom2); // => 1
 *
 * console.log(notFound); // => -1
 *
 * console.log(index); // => 3
 * ```
 */
export function lastIndexOfFrom<const Ar extends readonly unknown[]>(
  array: Ar,
  searchElement: Ar[number],
  fromIndex: ArgArrayIndexWithNegative<Ar>,
): ArrayIndex<Ar> | -1;

export function lastIndexOfFrom<E>(
  searchElement: E,
  fromIndex: SizeType.ArgArrWithNegative,
): (array: readonly E[]) => SizeType.Arr | -1;

export function lastIndexOfFrom<E>(
  ...args:
    | readonly [
        array: readonly E[],
        searchElement: E,
        fromIndex: SizeType.ArgArrWithNegative,
      ]
    | readonly [searchElement: E, fromIndex: SizeType.ArgArrWithNegative]
): SizeType.Arr | -1 | ((array: readonly E[]) => SizeType.Arr | -1) {
  switch (args.length) {
    case 3: {
      const [array, searchElement, fromIndex] = args;

      const index = array.lastIndexOf(searchElement, fromIndex);

      return index !== -1 ? asUint32(index) : -1;
    }

    case 2: {
      const [searchElement, fromIndex] = args;

      return (array) => lastIndexOfFrom(array, searchElement, fromIndex);
    }
  }
}
