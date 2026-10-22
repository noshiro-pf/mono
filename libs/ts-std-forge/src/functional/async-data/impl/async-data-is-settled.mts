import type { Ok } from '../../../adt-types.mjs';
import type { AsyncData, AsyncErr } from '../async-data.mjs';
import { isIdle } from './async-data-is-idle.mjs';
import { isPending } from './async-data-is-pending.mjs';

/**
 * Type guard for the settled variants. A settled `AsyncData` is a `Result`, so
 * the `Result` functions take it as it is.
 *
 * @example
 *
 * ```ts
 * const data = AsyncData.ok(2) as AsyncData<number, string>;
 *
 * if (AsyncData.isSettled(data)) {
 *   // A settled AsyncData is a Result.
 *   assert.deepStrictEqual(
 *     Result.map(data, (n) => n * 2),
 *     Result.ok(4),
 *   );
 * }
 * ```
 */
export const isSettled = <S, E>(
  data: AsyncData<S, E>,
): data is Ok<S> | AsyncErr<S, E> => !isIdle(data) && !isPending(data);
