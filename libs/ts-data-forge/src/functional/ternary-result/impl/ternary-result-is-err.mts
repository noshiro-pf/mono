import { ErrTypeTagName } from './tag.mjs';
import { type NarrowToErr } from './types.mjs';

/**
 * Type guard for the Err variant.
 *
 * @example
 *
 * ```ts
 * const maybeErr = TernaryResult.err('boom') as TernaryResult<
 *   number,
 *   string,
 *   string
 * >;
 *
 * if (TernaryResult.isErr(maybeErr)) {
 *   assert.strictEqual(maybeErr.value, 'boom');
 * }
 * ```
 */
export const isErr = <R extends UnknownTernaryResult>(
  result: R,
): result is NarrowToErr<R> => result.$$tag === ErrTypeTagName;
