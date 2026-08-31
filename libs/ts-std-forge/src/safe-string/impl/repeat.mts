// cspell:ignore ababab
import { Result } from 'ts-data-forge';
import { type SafeUint, type SmallUint } from 'ts-type-forge';
import { toUnexpectedError, type UnexpectedError } from '../../error/index.mjs';

/**
 * Repeats a string a given number of times without throwing.
 *
 * `String.prototype.repeat` throws a `RangeError` when `count` is negative
 * or infinite — excluded here at compile time by typing `count` as
 * `SafeUint | SmallUint` (the branded non-negative safe integer, with the
 * small literal union so that plain literals like `3` work directly — the
 * same pattern as `Num.div`'s denominator). What remains is the
 * implementation-defined limit: the spec lets the engine throw when the
 * resulting string would exceed its maximum length, which cannot be
 * predicted portably — so the result stays a `Result`, with that residue
 * surfacing as the `'unexpected'` fallback.
 *
 * @example
 *
 * ```ts
 * const okResult = SafeString.repeat('ab', 3);
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * assert.deepStrictEqual(okResult.value, 'ababab');
 * ```
 *
 * @param value The string to repeat.
 * @param count The number of repetitions (a non-negative safe integer;
 *   literals up to 39 need no cast, larger counts via `asSafeUint`).
 * @returns `Ok<string>` with the repeated string, or
 *   `Err<{ kind: 'unexpected', cause }>` when the result would exceed the
 *   engine's string-length limit.
 */
export const repeat = (
  value: string,
  count: SafeUint | SmallUint,
): Result<string, RepeatError> =>
  Result.mapErr(
    Result.fromThrowable(() => value.repeat(count)),
    toUnexpectedError,
  );

/**
 * The failure type of {@link repeat}: only the engine string-length limit
 * remains once the count is excluded by the parameter type.
 */
export type RepeatError = UnexpectedError;
