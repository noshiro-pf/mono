import { type UnknownResult } from '../result.mjs';
import { isOk } from './result-is-ok.mjs';
import { type NarrowToOk } from './types.mjs';

/**
 * Returns the `Result` if it is `Ok`, otherwise returns the alternative.
 *
 * @example
 *
 * ```ts
 * const primary = Result.ok('primary');
 *
 * const fallback = Result.ok('fallback');
 *
 * const failure = Result.err('failure');
 *
 * assert.deepStrictEqual(Result.orElse(primary, fallback), primary);
 *
 * assert.deepStrictEqual(Result.orElse(failure, fallback), fallback);
 *
 * const orElseFallback = Result.orElse(Result.ok('default'));
 *
 * assert.deepStrictEqual(
 *   orElseFallback(Result.err('missing')),
 *   Result.ok('default'),
 * );
 *
 * assert.deepStrictEqual(
 *   orElseFallback(Result.ok('value')),
 *   Result.ok('value'),
 * );
 * ```
 *
 * @template R The input `UnknownResult` type.
 * @param result The `Result` to check.
 * @param alternative The alternative `Result` to return if the first is
 *   `Err`.
 * @returns The first `Result` if `Ok`, otherwise the alternative.
 */
export function orElse<R extends UnknownResult, R2 extends UnknownResult>(
  result: R,
  alternative: R2,
): NarrowToOk<R> | R2;

// Curried version
export function orElse<R2 extends UnknownResult>(
  alternative: R2,
): <R extends UnknownResult>(result: R) => NarrowToOk<R> | R2;

export function orElse<R extends UnknownResult, R2 extends UnknownResult>(
  ...args: readonly [result: R, alternative: R2] | readonly [alternative: R2]
): (NarrowToOk<R> | R2) | ((result: R) => R | R2) {
  switch (args.length) {
    case 2: {
      // Direct version: first argument is result
      const [result, alternative] = args;

      return orElseImpl(result, alternative);
    }

    case 1: {
      // Curried version
      const [alternative] = args;

      return (result: R) => orElseImpl(result, alternative);
    }
  }
}

const orElseImpl = <R extends UnknownResult, R2 extends UnknownResult>(
  result: R,
  alternative: R2,
): NarrowToOk<R> | R2 => (isOk(result) ? result : alternative);
