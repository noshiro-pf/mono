import type { AsyncData, AsyncPending } from '../async-data.mjs';
import { latestOk } from './async-data-latest-ok.mjs';
import { pending } from './async-data-pending.mjs';

/**
 * Starts a request from the current `AsyncData`: a Pending whose `previous` is
 * the latest success value.
 *
 * @example
 *
 * ```ts
 * assert.deepStrictEqual(
 *   AsyncData.toPending(AsyncData.ok(1)),
 *   AsyncData.pending(Optional.some(1)),
 * );
 *
 * assert.deepStrictEqual(
 *   AsyncData.toPending(AsyncData.err('boom', Optional.some(1))),
 *   AsyncData.pending(Optional.some(1)),
 * );
 *
 * assert.deepStrictEqual(
 *   AsyncData.toPending(AsyncData.idle),
 *   AsyncData.pending(),
 * );
 * ```
 */
export const toPending = <S,>(data: AsyncData<S, unknown>): AsyncPending<S> =>
  pending(latestOk(data));
