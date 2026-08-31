import { Result } from 'ts-data-forge';
import { toUnexpectedError, type UnexpectedError } from '../../error/index.mjs';

/**
 * Converts a `Date` to an ISO 8601 string without throwing.
 *
 * `Date.prototype.toISOString` throws a `RangeError` when the date holds an
 * invalid time value (`NaN`). This wrapper validates that condition up front
 * — via `Number.isNaN(date.getTime())`, the same check the spec performs —
 * and returns the failure as a tagged `Err`.
 *
 * @example
 *
 * ```ts
 * const okResult = SafeDate.toISOString(new Date(0));
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * const errResult = SafeDate.toISOString(new Date(Number.NaN));
 *
 * assert.isTrue(Result.isErr(errResult));
 *
 * assert.deepStrictEqual(errResult.value, { kind: 'invalid-date' });
 * ```
 *
 * @param date The date to convert.
 * @returns `Ok<string>` with the ISO 8601 representation, or a tagged
 *   `Err` — `'invalid-date'` for the spec-defined failure, `'unexpected'`
 *   for anything the engine throws beyond it.
 */
export const toISOString = (
  date: Readonly<Date>,
): Result<string, ToISOStringError> => {
  if (Number.isNaN(date.getTime())) {
    return Result.err({ kind: 'invalid-date' });
  }

  return Result.mapErr(
    Result.fromThrowable(() => date.toISOString()),
    toUnexpectedError,
  );
};

/** The failure type of {@link toISOString}. */
export type ToISOStringError =
  Readonly<{ kind: 'invalid-date' }> | UnexpectedError;
