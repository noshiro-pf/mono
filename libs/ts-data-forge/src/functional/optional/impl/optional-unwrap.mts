import { isSome } from './optional-is-some.mjs';
import { type Unwrap } from './types.mjs';

/**
 * Unwraps an `Optional`, returning the contained value or `undefined` if
 * empty.
 *
 * This function provides a safe way to extract values from Optionals without
 * throwing exceptions. It has overloaded behavior based on the type:
 *
 * - For `Some<T>`: Always returns `T` (guaranteed by type system)
 * - For general `Optional<T>`: Returns `T | undefined`
 *
 * @example
 *
 * ```ts
 * const someString = Optional.some('text');
 *
 * const noneString = Optional.none as Optional<string>;
 *
 * assert(Optional.unwrap(someString) === 'text');
 *
 * assert(Optional.unwrap(noneString) === undefined);
 * ```
 *
 * @template O The `UnknownOptional` type to unwrap.
 * @param optional The `Optional` to unwrap.
 * @returns The contained value if `Some`, otherwise `undefined`.
 */
export function unwrap<O extends Some<unknown>>(optional: O): Unwrap<O>;

export function unwrap<O extends UnknownOptional>(
  optional: O,
): Unwrap<O> | undefined;

export function unwrap<O extends UnknownOptional>(
  optional: O,
): Unwrap<O> | undefined {
  return isSome(optional)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (optional.value as Unwrap<O>)
    : undefined;
}
