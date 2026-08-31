import { Result } from 'ts-data-forge';
import { toUnexpectedError, type UnexpectedError } from '../../error/index.mjs';

const MAX_CODE_POINT = 0x10_ffff;

/**
 * Builds a string from Unicode code points without throwing.
 *
 * `String.fromCodePoint` throws a `RangeError` when a code point is not an
 * integer in the range 0–0x10FFFF, which is reachable whenever the code
 * points come from variables. This wrapper validates each code point up
 * front and reports the first invalid one — with its value and position —
 * as a tagged `Err`.
 *
 * @example
 *
 * ```ts
 * const okResult = SafeString.fromCodePoint(0x61, 0x1f600);
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * const errResult = SafeString.fromCodePoint(0x110000);
 *
 * assert.isTrue(Result.isErr(errResult));
 *
 * assert.deepStrictEqual(errResult.value, {
 *   kind: 'invalid-code-point',
 *   codePoint: 0x110000,
 *   index: 0,
 * });
 * ```
 *
 * @param codePoints The Unicode code points (each an integer in 0–0x10FFFF).
 * @returns `Ok<string>` with the resulting string, or a tagged `Err` —
 *   `'invalid-code-point'` (with the offending value and its index) for the
 *   spec-defined failure, `'unexpected'` for anything the engine throws
 *   beyond it (e.g. a result exceeding the engine's string-length limit).
 */
export const fromCodePoint = (
  ...codePoints: readonly number[]
): Result<string, FromCodePointError> => {
  for (const [index, codePoint] of codePoints.entries()) {
    if (
      !Number.isSafeInteger(codePoint) ||
      codePoint < 0 ||
      codePoint > MAX_CODE_POINT
    ) {
      return Result.err({ kind: 'invalid-code-point', codePoint, index });
    }
  }

  return Result.mapErr(
    Result.fromThrowable(() => String.fromCodePoint(...codePoints)),
    toUnexpectedError,
  );
};

/** The failure type of {@link fromCodePoint}. */
export type FromCodePointError =
  | Readonly<{ kind: 'invalid-code-point'; codePoint: number; index: number }>
  | UnexpectedError;
