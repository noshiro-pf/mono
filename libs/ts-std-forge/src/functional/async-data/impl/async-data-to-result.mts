import { Optional } from '../../optional/index.mjs';
import { Result } from '../../result/index.mjs';
import type { AsyncData } from '../async-data.mjs';
import { isOk } from './async-data-is-ok.mjs';
import { isSettled } from './async-data-is-settled.mjs';

/**
 * A settled `AsyncData` as a plain `Result` (an Err loses `previous`), or
 * `Optional.none` while it is Idle or Pending.
 *
 * @example
 *
 * ```ts
 * assert.deepStrictEqual(
 *   AsyncData.toResult(AsyncData.err('boom', Optional.some(1))),
 *   Optional.some(Result.err('boom')),
 * );
 *
 * assert.deepStrictEqual(
 *   AsyncData.toResult(AsyncData.pending()),
 *   Optional.none,
 * );
 * ```
 */
export const toResult = <S, E>(
  data: AsyncData<S, E>,
): Optional<Result<S, E>> =>
  isSettled(data)
    ? Optional.some(isOk(data) ? Result.ok(data.value) : Result.err(data.value))
    : Optional.none;
