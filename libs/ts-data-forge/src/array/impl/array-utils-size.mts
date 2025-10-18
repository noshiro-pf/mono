/**
 * Returns the size (length) of an array.
 *
 * @example
 *
 * ```ts
 * const numbers = [1, 2, 3] as const;
 * const letters: string[] = [];
 *
 * const sizeOfNumbers = Arr.size(numbers);
 * const sizeOfLetters = Arr.size(letters);
 *
 * assert(sizeOfNumbers === 3);
 * assert(sizeOfLetters === 0);
 * ```
 */
export const size = <const Ar extends readonly unknown[]>(
  array: Ar,
): Ar extends NonEmptyArray<unknown>
  ? IntersectBrand<PositiveNumber, SizeType.Arr>
  : SizeType.Arr =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  array.length as never;

/**
 * Alias for `size`.
 *
 * @see {@link size}
 */
export const length = size;
