import { isNone } from './optional-is-none.mjs';
import { type Unwrap } from './types.mjs';

/**
 * Returns the `Optional` if it is `Some`, otherwise returns the alternative.
 *
 * Provides a way to chain Optional operations with fallback values. This is
 * particularly useful for implementing default behavior or cascading lookups.
 * Supports both direct usage and curried form for functional composition.
 *
 * @example
 *
 * ```ts
 * const preferred = Optional.some('primary');
 *
 * const fallback = Optional.some('secondary');
 *
 * const noneValue = Optional.none as Optional<string>;
 *
 * assert.deepStrictEqual(Optional.orElse(preferred, fallback), preferred);
 *
 * assert.deepStrictEqual(Optional.orElse(noneValue, fallback), fallback);
 *
 * const orElseFallback = Optional.orElse(Optional.some('default'));
 *
 * assert.deepStrictEqual(
 *   orElseFallback(Optional.none),
 *   Optional.some('default'),
 * );
 *
 * assert.deepStrictEqual(
 *   orElseFallback(Optional.some('value')),
 *   Optional.some('value'),
 * );
 * ```
 *
 * @template O The input `UnknownOptional` type.
 * @param optional The `Optional` to check.
 * @param alternative The alternative `Optional` to return if the first is
 *   `None`.
 * @returns The first `Optional` if `Some`, otherwise the alternative.
 */
export function orElse<
  O extends UnknownOptional,
  const O2 extends UnknownOptional,
>(optional: O, alternative: O2): O | O2;

// Curried version
export function orElse<S, S2>(
  alternative: Optional<S2>,
): (optional: Optional<S>) => Optional<S> | Optional<S2>;

export function orElse<
  O extends UnknownOptional,
  const O2 extends UnknownOptional,
>(
  ...args: readonly [optional: O, alternative: O2] | readonly [alternative: O2]
): (O | O2) | ((optional: Optional<Unwrap<O>>) => Optional<Unwrap<O>> | O2) {
  switch (args.length) {
    case 2: {
      const [optional, alternative] = args;

      return orElseImpl(optional, alternative);
    }

    case 1: {
      // Curried version
      const [alternative] = args;

      return (optional: Optional<Unwrap<O>>) =>
        orElseImpl(optional, alternative);
    }
  }
}

const orElseImpl = <
  O extends UnknownOptional,
  const O2 extends UnknownOptional,
>(
  optional: O,
  alternative: O2,
): O | O2 => (isNone(optional) ? alternative : optional);
