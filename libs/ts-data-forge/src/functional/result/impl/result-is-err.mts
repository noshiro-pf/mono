import { ErrTypeTagName } from './tag.mjs';
import { type NarrowToErr } from './types.mjs';

/**
 * Type guard for the error variant.
 *
 * @example
 *
 * ```ts
 * const operation = Result.ok(3);
 *
 * const failure = Result.err('error');
 *
 * if (Result.isOk(operation)) {
 *   const value: number = operation.value;
 *
 *   assert.isTrue(value === 3);
 * }
 *
 * assert.isTrue(Result.isErr(failure));
 * ```
 */
export const isErr = <R extends UnknownResult>(
  result: R,
): result is NarrowToErr<R> => result.$$tag === ErrTypeTagName;
