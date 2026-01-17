import { WarnTypeTagName } from './tag.mjs';
import { type NarrowToWarn } from './types.mjs';

/**
 * Type guard for the Warn variant.
 *
 * @example
 *
 * ```ts
 * const maybeWarn = TernaryResult.warn(
 *   'value',
 *   'check logs',
 * ) as TernaryResult<string, string, string>;
 *
 * if (TernaryResult.isWarn(maybeWarn)) {
 *   assert.strictEqual(maybeWarn.value, 'value');
 *
 *   assert.strictEqual(maybeWarn.warning, 'check logs');
 * }
 * ```
 */
export const isWarn = <R extends UnknownTernaryResult>(
  result: R,
): result is NarrowToWarn<R> => result.$$tag === WarnTypeTagName;
