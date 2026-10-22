import { Optional } from '../../optional/index.mjs';
import { Result } from '../../result/index.mjs';
import type { AsyncErr } from '../async-data.mjs';

/**
 * The `AsyncData` of a request that failed. To settle an existing `AsyncData`,
 * `AsyncData.settle` fills `previous` in.
 *
 * @example
 *
 * ```ts
 * const failed = AsyncData.err('network error', Optional.some(42));
 *
 * assert.isTrue(AsyncData.isErr(failed));
 *
 * assert.strictEqual(failed.value, 'network error');
 *
 * assert.deepStrictEqual(failed.previous, Optional.some(42));
 *
 * // It is still an Err of Result.
 * assert.isTrue(Result.isErr(failed));
 * ```
 *
 * @param error The error.
 * @param previous The latest success value; `Optional.none` by default.
 */
export const err = <const E, S = never>(
  error: E,
  previous: Optional<S> = Optional.none,
): AsyncErr<S, E> =>
  ({
    ...Result.err(error),
    previous,
  }) as const;
