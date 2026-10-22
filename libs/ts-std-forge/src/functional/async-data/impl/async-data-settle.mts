import type { Ok } from '../../../adt-types.mjs';
import { Result, type UnknownResult } from '../../result/index.mjs';
import type { AsyncData, AsyncErr } from '../async-data.mjs';
import { err } from './async-data-err.mjs';
import { latestOk } from './async-data-latest-ok.mjs';
import { ok } from './async-data-ok.mjs';

/**
 * Finishes a request: an Ok replaces the current `AsyncData`, and an Err keeps
 * its latest success value as `previous`.
 *
 * @example
 *
 * ```ts
 * const loaded = AsyncData.ok(1);
 *
 * const refreshing = AsyncData.toPending(loaded);
 *
 * const failed = AsyncData.settle(refreshing, Result.err('timeout'));
 *
 * // The failure keeps the value from before the refresh.
 * assert.deepStrictEqual(failed, AsyncData.err('timeout', Optional.some(1)));
 *
 * const retried = AsyncData.settle(Result.ok(2))(AsyncData.toPending(failed));
 *
 * assert.deepStrictEqual(retried, AsyncData.ok(2));
 * ```
 */
export function settle<S, E, R extends UnknownResult>(
  data: AsyncData<S, E>,
  result: R,
): Settled<S, E, R>;

// Curried version
//
// The returned function is generic over the data, so that the result can be
// written first without its other side: `Result.err('boom')` says nothing about
// the success type, which comes from the data instead.
export function settle<R extends UnknownResult>(
  result: R,
): <S, E>(data: AsyncData<S, E>) => Settled<S, E, R>;

export function settle<S, E, R extends UnknownResult>(
  ...args: readonly [data: AsyncData<S, E>, result: R] | readonly [result: R]
): Settled<S, E, R> | ((data: AsyncData<S, E>) => Settled<S, E, R>) {
  switch (args.length) {
    case 2: {
      const [data, result] = args;

      return settleImpl(data, result);
    }

    case 1: {
      const [result] = args;

      return (data: AsyncData<S, E>) => settleImpl(data, result);
    }
  }
}

type Settled<S, E, R extends UnknownResult> =
  Ok<S | Result.UnwrapOk<R>> | AsyncErr<S, E | Result.UnwrapErr<R>>;

const settleImpl = <S, E, R extends UnknownResult>(
  data: AsyncData<S, E>,
  result: R,
): Settled<S, E, R> =>
  Result.isOk(result)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      ok(result.value as Result.UnwrapOk<R>)
    : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      err(result.value as Result.UnwrapErr<R>, latestOk(data));
