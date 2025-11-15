import { isSome } from './optional-is-some.mjs';
import { type Unwrap } from './types.mjs';

/**
 * Unwraps an `Optional`, returning the contained value. Throws an error if
 * the `Optional` is `None`.
 *
 * This is a safer alternative to direct value access when you know the
 * Optional should contain a value. Use this method when an empty Optional
 * represents a programming error or unexpected condition.
 *
 * @example
 *
 * ```ts
 * const present = Optional.some('available');
 *
 * assert(Optional.unwrapThrow(present) === 'available');
 *
 * assert.throws(
 *   () => Optional.unwrapThrow(Optional.none),
 *   /has failed because it is `None`/u,
 * );
 * ```
 *
 * @template O The `UnknownOptional` type to unwrap.
 * @param optional The `Optional` to unwrap.
 * @returns The contained value if `Some`.
 * @throws {Error} Error with message "`unwrapThrow()` has failed because it
 *   is `None`" if the `Optional` is `None`.
 */
export const unwrapThrow = <O extends UnknownOptional>(
  optional: O,
): Unwrap<O> => {
  if (isSome(optional)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return optional.value as Unwrap<O>;
  }

  throw new Error('`unwrapThrow()` has failed because it is `None`');
};
