import { Result } from '../../result/index.mjs';
import type { AsyncData, AsyncErr } from '../async-data.mjs';
import { isSettled } from './async-data-is-settled.mjs';

/**
 * Type guard for the Err variant.
 *
 * @example
 *
 * ```ts
 * const data = AsyncData.err('boom', Optional.some(1)) as AsyncData<
 *   number,
 *   string
 * >;
 *
 * if (!AsyncData.isErr(data)) {
 *   return;
 * }
 *
 * assert.strictEqual(data.value, 'boom');
 *
 * assert.deepStrictEqual(data.previous, Optional.some(1));
 * ```
 */
export const isErr = <S, E>(data: AsyncData<S, E>): data is AsyncErr<S, E> =>
  isSettled(data) && Result.isErr(data);
