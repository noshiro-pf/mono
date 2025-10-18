/**
 * Casts a mutable type `T` to its `Readonly<T>` equivalent.
 *
 * This is a safe type assertion that adds immutability constraints at the type
 * level. The runtime value remains unchanged - only TypeScript's view of it
 * becomes readonly. This helps prevent accidental mutations and makes code
 * intentions clearer.
 *
 * @template T - The type of the mutable value
 * @param mutable - The mutable value to cast to readonly
 * @returns The same value with readonly modifiers added to its type
 * @see castDeepReadonly - For deeply nested structures
 * @see castMutable - For the opposite operation (use with caution)
 */
export const castReadonly = <T,>(mutable: T): Readonly<T> =>
  mutable as Readonly<T>;

/**
 * Casts a mutable type `T` to its `DeepReadonly<T>` equivalent, recursively
 * adding readonly modifiers.
 *
 * This is a safe type assertion that adds immutability constraints at ALL
 * levels of nesting. Provides complete protection against mutations in complex
 * data structures. The runtime value is unchanged - only TypeScript's type
 * checking is enhanced.
 *
 * @template T - The type of the mutable value
 * @param mutable - The mutable value to cast to deeply readonly
 * @returns The same value with readonly modifiers recursively added to all
 *   properties
 * @see castReadonly - For shallow readonly casting
 * @see castDeepMutable - For the opposite operation (use with extreme caution)
 */
export const castDeepReadonly = <T,>(mutable: T): DeepReadonly<T> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  mutable as DeepReadonly<T>;
