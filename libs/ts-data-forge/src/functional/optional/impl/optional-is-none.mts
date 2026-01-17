import { NoneTypeTagName } from './tag.mjs';
import { type NarrowToNone } from './types.mjs';

/**
 * Checks if an {@link Optional} is {@link None}. Acts as a type guard.
 *
 * @example
 *
 * ```ts
 * const optionalValue = Optional.none as Optional<number>;
 *
 * if (Optional.isNone(optionalValue)) {
 *   // Type narrowed to None
 *   expectType<typeof optionalValue, None>('=');
 * }
 * ```
 *
 * @template O The {@link UnknownOptional} type to check.
 * @param optional The {@link Optional} to check.
 * @returns `true` if the {@link Optional} is {@link None}, `false`
 *   otherwise.
 */
export const isNone = <O extends UnknownOptional>(
  optional: O,
): optional is NarrowToNone<O> => optional.$$tag === NoneTypeTagName;
