import { Optional } from '../../optional/index.mjs';
import { isOk } from './result-is-ok.mjs';
import { unwrapOk } from './result-unwrap-ok.mjs';
import { type UnwrapOk } from './types.mjs';

/**
 * Converts a `Result` to an `Optional`.
 *
 * This conversion is useful when you want to discard error information and
 * only care about whether an operation succeeded. The error information is
 * lost in this conversion, so use it when error details are not needed.
 *
 * If the `Result` is `Ok`, returns `Some` with the value. If the `Result` is
 * `Err`, returns `None`.
 *
 * @example
 *
 * ```ts
 * const okValue = Result.ok(7);
 *
 * const errValue = Result.err('fail');
 *
 * assert.deepStrictEqual(Result.toOptional(okValue), Optional.some(7));
 *
 * assert.deepStrictEqual(Result.toOptional(errValue), Optional.none);
 * ```
 *
 * @template R The input `UnknownResult` type.
 * @param result The `Result` to convert.
 * @returns An `Optional<UnwrapOk<R>>` containing the success value or
 *   representing `None`.
 */
export const toOptional = <R extends UnknownResult>(
  result: R,
): Optional<UnwrapOk<R>> =>
  isOk(result) ? Optional.some(unwrapOk(result)) : Optional.none;
