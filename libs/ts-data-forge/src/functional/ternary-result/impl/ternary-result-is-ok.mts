import { OkTypeTagName } from './tag.mjs';
import { type NarrowToOk } from './types.mjs';

/**
 * Type guard for the Ok variant.
 *
 * @example
 *
 * ```ts
 * const maybeNumber = TernaryResult.ok(42) as TernaryResult<
 *   number,
 *   string,
 *   string
 * >;
 *
 * if (TernaryResult.isOk(maybeNumber)) {
 *   const value: number = maybeNumber.value;
 *
 *   assert.strictEqual(value, 42);
 * }
 * ```
 */
export const isOk = <R extends UnknownTernaryResult>(
  result: R,
): result is NarrowToOk<R> => result.$$tag === OkTypeTagName;
