import type { UnknownOptional } from '../optional.mjs';
import { noneValue } from './encoding.mjs';
import type { NarrowToSome } from './types.mjs';

/**
 * Checks if an {@link Optional} is {@link Some}. Acts as a type guard.
 *
 * It tells a `Some` from `None` in a value typed as an Optional; it does not
 * validate untrusted input, in which any value other than the `None` string is
 * a valid `Some`. Nor does it recognize an Optional made before Optional was
 * unwrapped (`{ $$tag, value }`): it reads one, even an old `None`, as a `Some`
 * of that object.
 *
 * @example
 *
 * ```ts
 * const optionalNumber = Optional.some(42);
 *
 * if (!Optional.isSome(optionalNumber)) {
 *   return;
 * }
 *
 * const value: number = Optional.unwrap(optionalNumber);
 *
 * assert.isTrue(value === 42);
 * ```
 *
 * @template O The {@link UnknownOptional} type to check.
 * @param optional The {@link Optional} to check.
 * @returns `true` if the {@link Optional} is {@link Some}, `false`
 *   otherwise.
 */
export const isSome = <O extends UnknownOptional>(
  optional: O,
): optional is NarrowToSome<O> => (optional as unknown) !== noneValue;
