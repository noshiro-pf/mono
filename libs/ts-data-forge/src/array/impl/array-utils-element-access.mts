import { Optional, pipe } from '../../functional/index.mjs';

/**
 * Safely retrieves an element at a given index from an array, returning an Optional.
 *
 * @example
 *
 * ```ts
 * const letters: readonly string[] = ['a', 'b', 'c'];
 *
 * const two = Arr.at(letters, 1);
 * const last = Arr.at(-1)(letters);
 * const missing = Arr.at(letters, 5);
 *
 * assert.deepStrictEqual(two, Optional.some('b'));
 * assert.deepStrictEqual(last, Optional.some('c'));
 * assert.deepStrictEqual(missing, Optional.none);
 * ```
 */
export function at<const Ar extends readonly unknown[]>(
  array: Ar,
  index: ArgArrayIndexWithNegative<Ar>,
): Optional<Ar[number]>;

// Curried version

export function at(
  index: SizeType.ArgArrWithNegative,
): <E>(array: readonly E[]) => Optional<E>;

export function at<E>(
  ...args:
    | readonly [array: readonly E[], index: SizeType.ArgArrWithNegative]
    | readonly [index: SizeType.ArgArrWithNegative]
): Optional<E> | ((array: readonly E[]) => Optional<E>) {
  switch (args.length) {
    case 2: {
      const [array, index] = args;
      return pipe(index < 0 ? array.length + index : index).map(
        (normalizedIndex) =>
          normalizedIndex < 0 || normalizedIndex >= array.length
            ? Optional.none
            : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              Optional.some(array[normalizedIndex]!),
      ).value;
    }
    case 1: {
      const [index] = args;
      return (array) => at(array, index);
    }
  }
}

/**
 * Returns the first element of an array as an Optional.
 *
 * @example
 *
 * ```ts
 * const users = [{ id: 1 }, { id: 2 }];
 * const empty: { id: number }[] = [];
 *
 * const first = Arr.head(users);
 * const none = Arr.head(empty);
 *
 * assert.deepStrictEqual(first, Optional.some({ id: 1 }));
 * assert.deepStrictEqual(none, Optional.none);
 * ```
 */
export const head = <const Ar extends readonly unknown[]>(
  array: Ar,
): Ar extends readonly []
  ? None
  : Ar extends readonly [infer E, ...unknown[]]
    ? Some<E>
    : Ar extends NonEmptyArray<infer E>
      ? Some<E>
      : Optional<Ar[number]> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  (array.length === 0 ? Optional.none : Optional.some(array.at(0))) as never;

/**
 * Returns the last element of an array as an Optional.
 *
 * @example
 *
 * ```ts
 * const queue = ['first', 'second'];
 * const emptyQueue: string[] = [];
 *
 * const lastValue = Arr.last(queue);
 * const none = Arr.last(emptyQueue);
 *
 * assert.deepStrictEqual(lastValue, Optional.some('second'));
 * assert.deepStrictEqual(none, Optional.none);
 * ```
 */
export const last = <const Ar extends readonly unknown[]>(
  array: Ar,
): Ar extends readonly []
  ? None
  : Ar extends readonly [...unknown[], infer E]
    ? Some<E>
    : Ar extends NonEmptyArray<infer E>
      ? Some<E>
      : Optional<Ar[number]> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  (array.length === 0 ? Optional.none : Optional.some(array.at(-1))) as never;

/**
 * Alias for `head`.
 *
 * @see {@link head}
 */
export const first = head;
