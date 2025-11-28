import { unwrap } from './optional-unwrap.mjs';
import { type Unwrap } from './types.mjs';

/**
 * Unwraps an `Optional`, returning the contained value or a default value if
 * it's `None`.
 *
 * Supports both direct usage and curried form for functional composition.
 * This is often preferred over `unwrap()` when you have a sensible fallback
 * value.
 *
 * @example
 *
 * ```ts
 * const withValue = Optional.some(5);
 *
 * const withoutValue = Optional.none as Optional<number>;
 *
 * assert.isTrue(Optional.unwrapOr(withValue, 0) === 5);
 *
 * assert.isTrue(Optional.unwrapOr(withoutValue, 0) === 0);
 *
 * const unwrapWithDefault = Optional.unwrapOr(10);
 *
 * assert.isTrue(unwrapWithDefault(Optional.some(3)) === 3);
 *
 * assert.isTrue(unwrapWithDefault(Optional.none) === 10);
 * ```
 *
 * @template O The `UnknownOptional` type to unwrap.
 * @template D The type of the default value.
 * @param optional The `Optional` to unwrap.
 * @param defaultValue The value to return if `optional` is `None`.
 * @returns The contained value if `Some`, otherwise `defaultValue`.
 */
export function unwrapOr<O extends UnknownOptional, D>(
  optional: O,
  defaultValue: D,
): D | Unwrap<O>;

// Curried version
export function unwrapOr<S, D>(
  defaultValue: D,
): (optional: Optional<S>) => D | S;

export function unwrapOr<O extends UnknownOptional, D>(
  ...args: readonly [optional: O, defaultValue: D] | readonly [defaultValue: D]
): (D | Unwrap<O>) | ((optional: Optional<Unwrap<O>>) => D | Unwrap<O>) {
  switch (args.length) {
    case 2: {
      const [optional, defaultValue] = args;

      return unwrapOrImpl(optional, defaultValue);
    }

    case 1: {
      // Curried version: first argument is default value
      const [defaultValue] = args;

      return (optional: Optional<Unwrap<O>>) =>
        unwrapOrImpl(optional, defaultValue);
    }
  }
}

const unwrapOrImpl = <O extends UnknownOptional, D>(
  optional: O,
  defaultValue: D,
): D | Unwrap<O> => unwrap(optional) ?? defaultValue;
