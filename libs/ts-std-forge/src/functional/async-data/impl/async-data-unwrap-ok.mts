import type { AsyncData } from '../async-data.mjs';
import { isOk } from './async-data-is-ok.mjs';

/**
 * The value of an Ok, otherwise `undefined`. A `previous` value is never
 * returned; `AsyncData.latestOk` is the function that reads it.
 *
 * @example
 *
 * ```ts
 * assert.strictEqual(AsyncData.unwrapOk(AsyncData.ok(1)), 1);
 *
 * // A previous value is not returned.
 * assert.isUndefined(AsyncData.unwrapOk(AsyncData.pending(Optional.some(1))));
 * ```
 */
export const unwrapOk = <S,>(data: AsyncData<S, unknown>): S | undefined =>
  isOk(data) ? data.value : undefined;
