import { OkTypeTagName } from './tag.mjs';
import { type NarrowToOk } from './types.mjs';

/**
 * Type guard for the ok variant.
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
 *   assert(value === 3);
 * }
 *
 * assert.ok(Result.isErr(failure));
 * ```
 */
export const isOk = <R extends UnknownResult>(
  result: R,
): result is NarrowToOk<R> => result.$$tag === OkTypeTagName;
