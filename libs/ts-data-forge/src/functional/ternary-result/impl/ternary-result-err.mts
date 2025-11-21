import { ErrTypeTagName } from './tag.mjs';

/**
 * Creates a `TernaryResult.Err` containing the provided error value.
 *
 * @example
 *
 * ```ts
 * const failure = TernaryResult.err(new Error('missing data'));
 *
 * assert.strictEqual(failure.$$tag, 'ts-data-forge::Result.err');
 *
 * assert.ok(TernaryResult.isErr(failure));
 * ```
 */
export const err = <const E,>(value: E): TernaryErr<E> => ({
  $$tag: ErrTypeTagName,
  value,
});
