/**
 * Applies a function to a value if the value is not `null` or `undefined`. If
 * the value is `null` or `undefined`, it returns `undefined`.
 *
 * This function provides a safe way to transform nullable values without
 * explicit null checks. It's similar to Optional.map() but works directly with
 * TypeScript's nullable types. Supports both regular and curried usage for
 * functional composition.
 *
 * @template A - The type of the input value (excluding null/undefined)
 * @template B - The type of the value returned by the mapping function
 * @param value - The value to potentially transform (can be `A`, `null`, or
 *   `undefined`)
 * @param mapFn - A function that transforms a non-nullable value of type `A` to
 *   type `B`
 * @returns The result of applying `mapFn` to `value` if value is not
 *   null/undefined; otherwise `undefined`
 * @see Optional - For more complex optional value handling
 * @see Result - For error handling with detailed error information
 */
export function mapNullable<const A, const B>(
  value: A | null | undefined,
  mapFn: (v: A) => B,
): B | undefined;

// Curried version
export function mapNullable<const A, const B>(
  mapFn: (v: A) => B,
): (value: A | null | undefined) => B | undefined;

export function mapNullable<const A, const B>(
  ...args:
    | readonly [value: A | null | undefined, mapFn: (v: A) => B]
    | readonly [mapFn: (v: A) => B]
): (B | undefined) | ((value: A | null | undefined) => B | undefined) {
  switch (args.length) {
    case 2: {
      const [value, mapFn] = args;

      return value == null ? undefined : mapFn(value);
    }

    case 1: {
      const [mapFn] = args;

      return (value: A | null | undefined) => mapNullable(value, mapFn);
    }
  }
}
