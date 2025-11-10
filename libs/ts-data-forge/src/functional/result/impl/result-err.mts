import { ErrTypeTagName } from './tag.mjs';

/**
 * Creates a `Result.Err` containing the given error value.
 *
 * Use this constructor when an operation fails and you want to wrap the error
 * information in a Result type for consistent error handling.
 *
 * @example
 *
 * ```ts
 * const success = Result.ok({ id: 1 });
 * const failure = Result.err(new Error('missing data'));
 *
 * assert.deepStrictEqual(success, {
 *   $$tag: 'ts-data-forge::Result.ok',
 *   value: { id: 1 },
 * });
 * assert.ok(Result.isErr(failure));
 * ```
 *
 * @template E The type of the error value.
 * @param value The error value.
 * @returns A `Result.Err<E>` containing the value.
 */
export const err = <E,>(value: E): Err<E> => ({
  $$tag: ErrTypeTagName,
  value,
});
