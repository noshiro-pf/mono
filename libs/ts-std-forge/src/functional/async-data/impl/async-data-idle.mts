import type { AsyncIdle } from '../async-data.mjs';
import { IdleTypeTagName } from './tag.mjs';

/**
 * The `AsyncData` of a request that has not started yet.
 *
 * @example
 *
 * ```ts
 * const data = AsyncData.idle;
 *
 * assert.isTrue(AsyncData.isIdle(data));
 *
 * assert.deepStrictEqual(AsyncData.latestOk(data), Optional.none);
 * ```
 */
export const idle: AsyncIdle = { $$tag: IdleTypeTagName } as const;
