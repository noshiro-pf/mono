/**
 * Internal utilities for creating and managing refined (branded) number types.
 *
 * This namespace provides factory functions and type utilities for building
 * type-safe numeric operations with compile-time constraints. It serves as
 * the foundation for all branded number types in the library, including:
 *
 * - Integer types (Int, SafeInt, Int8, Int16, Int32)
 * - Unsigned types (UInt, UInt8, UInt16, UInt32)
 * - Constrained types (NonZero, NonNegative, Positive)
 * - Range-bounded types
 *
 * The utilities handle:
 *
 * - Type validation and narrowing
 * - Arithmetic operations that preserve type constraints
 * - Automatic clamping for bounded types
 * - Random number generation within type bounds
 *
 * @internal This namespace is not part of the public API
 */
export * as RefinedNumberUtils from './refined-number-utils-impl.mjs';
