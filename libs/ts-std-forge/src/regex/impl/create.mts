import { Result } from 'ts-data-forge';

/**
 * Creates a `RegExp` from a dynamic pattern without throwing.
 *
 * `new RegExp` throws a `SyntaxError` when the pattern or flags are invalid.
 * Pattern validity is the engine's own grammar check, so — unlike the range
 * conditions of the number and string wrappers — it cannot reasonably be
 * validated in advance; the failure is caught instead and returned as a
 * single tagged `Err` with the engine's `SyntaxError` attached as `cause`
 * (its message is the only description of what is wrong with the pattern,
 * but note that its wording is engine-specific).
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
 * @returns `Ok<RegExp>` with the compiled expression, or a tagged
 *   `Err<{ kind: 'invalid-regexp'; cause: Error }>` when the pattern or
 *   flags are invalid.
 */
export const create = (
  pattern: string,
  flags?: string,
): Result<RegExp, CreateError> =>
  Result.mapErr(
    // eslint-disable-next-line security/detect-non-literal-regexp
    Result.fromThrowable(() => new RegExp(pattern, flags)),
    (cause) => ({ kind: 'invalid-regexp', cause }),
  );

/** The failure type of {@link create}. */
export type CreateError = Readonly<{
  kind: 'invalid-regexp';
  cause: Readonly<Error>;
}>;
