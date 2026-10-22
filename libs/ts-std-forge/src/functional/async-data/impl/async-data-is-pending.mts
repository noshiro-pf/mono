import type { AsyncData, AsyncPending } from '../async-data.mjs';
import { PendingTypeTagName } from './tag.mjs';

/**
 * Type guard for the Pending variant.
 *
 * @example
 *
 * ```ts
 * const data = AsyncData.pending(Optional.some(1)) as AsyncData<
 *   number,
 *   string
 * >;
 *
 * if (AsyncData.isPending(data)) {
 *   assert.deepStrictEqual(data.previous, Optional.some(1));
 * }
 * ```
 */
export const isPending = <S, E>(
  data: AsyncData<S, E>,
): data is AsyncPending<S> => data.$$tag === PendingTypeTagName;
