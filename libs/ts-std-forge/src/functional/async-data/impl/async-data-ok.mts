import type { Ok } from '../../../adt-types.mjs';
import { Result } from '../../result/index.mjs';

/**
 * The `AsyncData` of a request that succeeded: the `Ok` of `Result`.
 *
 * @example
 *
 * ```ts
 * const data = AsyncData.ok(42);
 *
 * assert.isTrue(AsyncData.isOk(data));
 *
 * assert.deepStrictEqual(data, Result.ok(42));
 * ```
 */
export const ok = <const S,>(value: S): Ok<S> => Result.ok(value);
