import type { Ok } from '../../../adt-types.mjs';
import { Result } from '../../result/index.mjs';
import type { AsyncData } from '../async-data.mjs';
import { isSettled } from './async-data-is-settled.mjs';

/**
 * Type guard for the Ok variant.
 *
 * @example
 *
 * ```ts
 * const data = AsyncData.ok(2) as AsyncData<number, string>;
 *
 * if (AsyncData.isOk(data)) {
 *   assert.strictEqual(data.value, 2);
 * }
 * ```
 */
export const isOk = <S, E>(data: AsyncData<S, E>): data is Ok<S> =>
  isSettled(data) && Result.isOk(data);
