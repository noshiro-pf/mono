import { err } from './result-err.mjs';
import { isOk } from './result-is-ok.mjs';
import { ok } from './result-ok.mjs';
import { unwrapOk } from './result-unwrap-ok.mjs';
import { type UnwrapErr, type UnwrapOk } from './types.mjs';

/**
 * Swaps the success and error values of a `Result`.
 *
 * @example
 *
 * ```ts
 * const okValue = Result.ok('value');
 * const errValue = Result.err('error');
 *
 * assert.deepStrictEqual(Result.swap(okValue), Result.err('value'));
 * assert.deepStrictEqual(Result.swap(errValue), Result.ok('error'));
 * ```
 *
 * @template R The input `UnknownResult` type.
 * @param result The `Result` to swap.
 * @returns A new `Result` with success and error swapped.
 */
export const swap = <R extends UnknownResult>(
  result: R,
): Result<UnwrapErr<R>, UnwrapOk<R>> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  isOk(result) ? err(unwrapOk(result)) : ok(result.value as UnwrapErr<R>);
