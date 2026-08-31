import { Result } from 'ts-data-forge';
import { toUnexpectedError, type UnexpectedError } from '../../error/index.mjs';

/**
 * Creates a `RegExp` from a dynamic pattern without throwing.
 *
 * `new RegExp` throws a `SyntaxError` when the pattern or flags are invalid.
 * Pattern validity is the engine's own grammar check, so — unlike the range
 * conditions of the number and string wrappers — it cannot reasonably be
 * validated in advance; the failure is caught instead. Classification is
 * conservative: only a caught `SyntaxError` (the error type the spec
 * mandates for parse failures) becomes `'invalid-regexp'`, with the error
 * attached as `cause`; anything else the engine throws surfaces as the
 * `'unexpected'` fallback.
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
 *
 * assert.deepStrictEqual(errResult.value.kind, 'invalid-regexp');
 * ```
 *
 * @param pattern The regular expression pattern.
 * @param flags Optional flags string.
 * @returns `Ok<RegExp>` with the compiled expression, or a tagged `Err` —
 *   `'invalid-regexp'` (with the `SyntaxError` as `cause`) when the pattern
 *   or flags are invalid, `'unexpected'` for any other throw.
 */
export const create = (
  pattern: string,
  flags?: string,
): Result<RegExp, CreateError> =>
  Result.mapErr(
    // eslint-disable-next-line security/detect-non-literal-regexp
    Result.fromThrowable(() => new RegExp(pattern, flags)),
    (cause) =>
      cause.name === 'SyntaxError'
        ? { kind: 'invalid-regexp', cause }
        : toUnexpectedError(cause),
  );

/** The failure type of {@link create}. */
export type CreateError =
  | Readonly<{ kind: 'invalid-regexp'; cause: Readonly<Error> }>
  | UnexpectedError;
