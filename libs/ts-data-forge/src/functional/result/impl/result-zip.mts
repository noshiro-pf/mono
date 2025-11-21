import { isOk } from './result-is-ok.mjs';
import { ok } from './result-ok.mjs';

/**
 * Combines two `Result` values into a single `Result` containing a tuple. If
 * either `Result` is `Err`, returns the first `Err` encountered.
 *
 * @example
 *
 * ```ts
 * const first = Result.ok('left');
 *
 * const second = Result.ok(1);
 *
 * const expected = ['left', 1] as const;
 *
 * assert.deepStrictEqual(Result.zip(first, second), Result.ok(expected));
 *
 * assert.deepStrictEqual(
 *   Result.zip(first, Result.err('error')),
 *   Result.err('error'),
 * );
 * ```
 *
 * @template S1 The success type of the first `Result`.
 * @template E1 The error type of the first `Result`.
 * @template S2 The success type of the second `Result`.
 * @template E2 The error type of the second `Result`.
 * @param resultA The first `Result`.
 * @param resultB The second `Result`.
 * @returns A `Result` containing a tuple of both values, or the first `Err`.
 */
export const zip = <S1, E1, S2, E2>(
  resultA: Result<S1, E1>,
  resultB: Result<S2, E2>,
): Result<readonly [S1, S2], E1 | E2> =>
  isOk(resultA)
    ? isOk(resultB)
      ? ok([resultA.value, resultB.value] as const)
      : resultB
    : resultA;
