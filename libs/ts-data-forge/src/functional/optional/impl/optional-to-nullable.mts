import { isSome } from './optional-is-some.mjs';
import { unwrap } from './optional-unwrap.mjs';
import { type Unwrap } from './types.mjs';

/**
 * Converts an `Optional` to a nullable value.
 *
 * This function extracts the value from an Optional, returning `undefined`
 * for empty Optionals. This is useful when interfacing with APIs or systems
 * that expect nullable values rather than Optional types.
 *
 * Note: This returns `undefined` (not `null`) for consistency with
 * JavaScript's undefined semantics and TypeScript's optional properties.
 *
 * @example
 *
 * ```ts
 * const someNumber = Optional.some(42);
 *
 * const noneNumber = Optional.none as Optional<number>;
 *
 * assert.isTrue(Optional.toNullable(someNumber) === 42);
 *
 * assert.isTrue(Optional.toNullable(noneNumber) === undefined);
 * ```
 *
 * @template O The `UnknownOptional` type to convert.
 * @param optional The `Optional` to convert.
 * @returns The contained value if `Some`, otherwise `undefined`.
 */
export const toNullable = <O extends UnknownOptional>(
  optional: O,
): Unwrap<O> | undefined => (isSome(optional) ? unwrap(optional) : undefined);
