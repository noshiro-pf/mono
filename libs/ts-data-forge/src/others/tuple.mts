/**
 * Creates a readonly tuple from the given arguments with precise literal type
 * inference. It is a convenient shorthand for `[...args] as const`.
 *
 * @example
 *
 * ```ts
 * // Create a tuple with literal types preserved
 * const coordinates = tp(10, 20, 30);
 * expectType<typeof coordinates, readonly [10, 20, 30]>('=');
 * expectType<typeof coordinates, readonly number[]>('!=');
 * assert.deepStrictEqual(coordinates, [10, 20, 30]);
 *
 * // The following two are equivalent
 * const a = tp(1, 2);
 * const b = [1, 2] as const;
 * expectType<typeof a, typeof b>('=');
 * assert.deepStrictEqual(a, b);
 *
 * // Without tp, type would be number[]
 * const point = tp('x', 42, true);
 * expectType<typeof point, readonly ['x', 42, true]>('=');
 * assert.deepStrictEqual(point, ['x', 42, true]);
 *
 * // Useful for creating const tuples
 * const rgb = tp(255, 128, 0);
 * expectType<typeof rgb, readonly [255, 128, 0]>('=');
 *
 * assert(rgb[0] === 255);
 * assert(rgb[1] === 128);
 * assert(rgb[2] === 0);
 * ```
 *
 * @template T - A tuple type with literal types inferred from the arguments
 * @param args - The elements to include in the tuple (variadic)
 * @returns A readonly tuple containing the provided arguments with preserved
 *   literal types
 * @see https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types
 */
export const tp = <const T extends readonly unknown[]>(
  ...args: T
): Readonly<T> => args;
