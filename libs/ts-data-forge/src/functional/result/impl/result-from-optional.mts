import { Optional, type UnknownOptional } from '../../optional/index.mjs';
import { type Result } from '../result.mjs';
import { err } from './result-err.mjs';
import { ok } from './result-ok.mjs';

/**
 * Converts an {@link Optional} to a `Result` (the inverse of
 * {@link Result.toOptional}, and the equivalent of Rust's `Option::ok_or`).
 *
 * If the {@link Optional} is `Some`, returns `Ok` with the contained value.
 * If it is `None`, returns `Err` with the provided error value.
 *
 * @example
 *
 * ```ts
 * assert.deepStrictEqual(
 *   Result.fromOptional(Optional.some(42), 'missing'),
 *   Result.ok(42),
 * );
 *
 * assert.deepStrictEqual(
 *   Result.fromOptional(Optional.none, 'missing'),
 *   Result.err('missing'),
 * );
 *
 * const withMissingError = Result.fromOptional('missing');
 *
 * assert.deepStrictEqual(withMissingError(Optional.some(1)), Result.ok(1));
 *
 * assert.deepStrictEqual(withMissingError(Optional.none), Result.err('missing'));
 * ```
 *
 * @template O The input `UnknownOptional` type.
 * @template E The type of the error value used for the `None` case.
 * @param optional The `Optional` to convert.
 * @param error The error value to use if the `Optional` is `None`.
 * @returns `Ok` with the contained value, or `Err` with `error`.
 */
export function fromOptional<O extends UnknownOptional, const E>(
  optional: O,
  error: E,
): Result<Optional.Unwrap<O>, E>;

// Curried version
export function fromOptional<const E>(
  error: E,
): <O extends UnknownOptional>(optional: O) => Result<Optional.Unwrap<O>, E>;

export function fromOptional<O extends UnknownOptional, const E>(
  ...args: readonly [optional: O, error: E] | readonly [error: E]
):
  | Result<Optional.Unwrap<O>, E>
  | ((optional: O) => Result<Optional.Unwrap<O>, E>) {
  switch (args.length) {
    case 2: {
      const [optional, error] = args;

      return fromOptionalImpl(optional, error);
    }

    case 1: {
      // Curried version: the only argument is the error value
      const [error] = args;

      return (optional: O) => fromOptionalImpl(optional, error);
    }
  }
}

const fromOptionalImpl = <O extends UnknownOptional, E>(
  optional: O,
  error: E,
): Result<Optional.Unwrap<O>, E> =>
  Optional.isSome(optional)
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ok(Optional.unwrap(optional)!)
    : err(error);
