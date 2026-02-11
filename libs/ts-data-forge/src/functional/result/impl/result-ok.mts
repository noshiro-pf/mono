import { OkTypeTagName } from './tag.mjs';

/**
 * Creates a `Result.Ok` containing the given success value.
 *
 * Use this constructor when an operation succeeds and you want to wrap the
 * successful result in a Result type for consistent error handling.
 *
 * @example
 *
 * ```ts
 * const success = Result.ok({ id: 1 });
 *
 * const failure = Result.err(new Error('missing data'));
 *
 * assert.deepStrictEqual(success, {
 *   $$tag: 'ts-data-forge::Result.ok',
 *   value: { id: 1 },
 * });
 *
 * assert.isTrue(Result.isErr(failure));
 * ```
 *
 * @template S The type of the success value.
 * @param value The success value.
 * @returns A `Result.Ok<S>` containing the value.
 */
export const ok = <const S,>(value: S): Ok<S> =>
  ({
    $$tag: OkTypeTagName,
    value,
  }) as const;
