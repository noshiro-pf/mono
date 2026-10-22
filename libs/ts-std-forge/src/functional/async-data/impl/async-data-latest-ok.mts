import { Optional } from '../../optional/index.mjs';
import type { AsyncData } from '../async-data.mjs';
import { isIdle } from './async-data-is-idle.mjs';
import { isOk } from './async-data-is-ok.mjs';

/**
 * The latest success value: the value of an Ok, or the `previous` of a Pending
 * or an Err. Use it to keep showing the last data while a request is repeated
 * or after it fails.
 *
 * @example
 *
 * ```ts
 * assert.deepStrictEqual(
 *   AsyncData.latestOk(AsyncData.ok(1)),
 *   Optional.some(1),
 * );
 *
 * assert.deepStrictEqual(
 *   AsyncData.latestOk(AsyncData.pending(Optional.some(1))),
 *   Optional.some(1),
 * );
 *
 * assert.deepStrictEqual(
 *   AsyncData.latestOk(AsyncData.err('boom', Optional.some(1))),
 *   Optional.some(1),
 * );
 *
 * assert.deepStrictEqual(AsyncData.latestOk(AsyncData.idle), Optional.none);
 * ```
 */
export const latestOk = <S,>(data: AsyncData<S, unknown>): Optional<S> =>
  isOk(data)
    ? Optional.some(data.value)
    : isIdle(data)
      ? Optional.none
      : data.previous;
