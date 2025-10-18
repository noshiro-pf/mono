/**
 * Casts a readonly type `T` to its `Mutable<T>` equivalent.
 *
 * **⚠️ Safety Warning**: This is a type assertion that bypasses TypeScript's
 * immutability guarantees. The runtime value remains unchanged - only the type
 * system's view of it changes. Use with caution as it can lead to unexpected
 * mutations of data that was intended to be immutable.
 *
 * @template T - The type of the readonly value
 * @param readonlyValue - The readonly value to cast to mutable
 * @returns The same value with readonly modifiers removed from its type
 * @see castDeepMutable - For deeply nested readonly structures
 * @see castReadonly - For the opposite operation
 */
export const castMutable = <T,>(readonlyValue: T): Mutable<T> =>
  readonlyValue as Mutable<T>;

/**
 * Casts a readonly type `T` to its `DeepMutable<T>` equivalent, recursively
 * removing all readonly modifiers.
 *
 * **⚠️ Safety Warning**: This recursively bypasses ALL immutability guarantees
 * in nested structures. Extremely dangerous for complex data structures as it
 * allows mutation at any depth. The runtime value is unchanged - only
 * TypeScript's type checking is affected.
 *
 * @template T - The type of the deeply readonly value
 * @param readonlyValue - The deeply readonly value to cast to deeply mutable
 * @returns The same value with all readonly modifiers recursively removed from
 *   its type
 * @see castMutable - For shallow mutability casting
 * @see castDeepReadonly - For the opposite operation
 * @see structuredClone - Recommended for creating safe copies before mutation
 */
export const castDeepMutable = <T,>(readonlyValue: T): DeepMutable<T> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  readonlyValue as DeepMutable<T>;
