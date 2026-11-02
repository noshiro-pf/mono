/**
 * Namespace providing utility functions for number manipulation and validation.
 *
 * This namespace offers a comprehensive set of type-safe number utilities
 * including:
 *
 * - Type conversion and validation
 * - Type guards for numeric constraints (non-zero, non-negative, positive)
 * - Range checking and clamping operations
 * - Mathematical operations with type safety
 * - Rounding utilities
 *
 * Many functions in this namespace leverage TypeScript's type system to provide
 * compile-time guarantees about numeric constraints.
 */
export * as Num from './impl/index.mjs';
