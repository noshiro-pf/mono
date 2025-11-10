import { isOk } from './result-is-ok.mjs';
import { type UnwrapOk } from './types.mjs';

/**
 * Safely unwraps the success value, returning `undefined` for failures.
 *
 * @example
 *
 * ```ts
 * const okResult = Result.ok(42);
 * const errResult = Result.err('oops');
 *
 * // Result.unwrapOk returns the value for Ok results
 *
 * assert(Result.unwrapOk(okResult) === 42);
 *
 * // Result.unwrapOk returns undefined for Err results
 *
 * // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
 * assert(Result.unwrapOk(errResult) === undefined);
 * ```
 */
export function unwrapOk<R extends Ok<unknown>>(result: R): UnwrapOk<R>;
export function unwrapOk<R extends UnknownResult>(
  result: R,
): UnwrapOk<R> | undefined;

export function unwrapOk<R extends UnknownResult>(
  result: R,
): UnwrapOk<R> | undefined {
  return isOk(result)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (result.value as UnwrapOk<R>)
    : undefined;
}
