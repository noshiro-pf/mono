import { Result } from 'ts-data-forge';

/**
 * Creates a `RegExp` from a dynamic pattern without throwing.
 *
 * `new RegExp` throws a `SyntaxError` when the pattern or flags are invalid,
 * which is reachable whenever the pattern comes from a variable. This wrapper
 * returns the failure as a `Result` instead. For patterns known at compile
 * time, prefer a regex literal (`/…/u`), which is checked statically.
 *
 * @example
 *
 * ```ts
 * const okResult = Regex.create('^a+$', 'u');
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * const errResult = Regex.create('(');
 *
 * assert.isTrue(Result.isErr(errResult));
 * ```
 *
 * @param pattern The regular expression pattern.
 * @param flags Optional flags string (e.g. `'u'`, `'gi'`).
 * @returns `Ok<RegExp>` if the pattern compiles, `Err<Error>` otherwise.
 */
export const create = (
  pattern: string,
  flags?: string,
): Result<RegExp, Error> =>
  // eslint-disable-next-line security/detect-non-literal-regexp
  Result.fromThrowable(() => new RegExp(pattern, flags));
