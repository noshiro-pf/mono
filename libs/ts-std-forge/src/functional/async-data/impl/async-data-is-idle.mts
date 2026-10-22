import type { AsyncData, AsyncIdle } from '../async-data.mjs';
import { IdleTypeTagName } from './tag.mjs';

/**
 * Type guard for the Idle variant.
 *
 * @example
 *
 * ```ts
 * const data = AsyncData.idle as AsyncData<number, string>;
 *
 * if (AsyncData.isIdle(data)) {
 *   assert.deepStrictEqual(data, AsyncData.idle);
 * }
 * ```
 */
export const isIdle = <S, E>(data: AsyncData<S, E>): data is AsyncIdle =>
  data.$$tag === IdleTypeTagName;
