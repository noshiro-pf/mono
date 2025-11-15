import { SomeTypeTagName } from './tag.mjs';
import { type NarrowToSome } from './types.mjs';

/**
 * Checks if an {@link Optional} is {@link Some}. Acts as a type guard.
 *
 * @example
 *
 * ```ts
 * const optionalNumber = Optional.some(42);
 *
 * if (Optional.isSome(optionalNumber)) {
 *   const value: number = optionalNumber.value;
 *
 *   assert(value === 42);
 * }
 * ```
 *
 * @template O The {@link UnknownOptional} type to check.
 * @param optional The {@link Optional} to check.
 * @returns `true` if the {@link Optional} is {@link Some}, `false`
 *   otherwise.
 */
export const isSome = <O extends UnknownOptional>(
  optional: O,
): optional is NarrowToSome<O> => optional.$$tag === SomeTypeTagName;
