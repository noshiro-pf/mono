import { isSome } from './optional-is-some.mjs';
import { unwrap } from './optional-unwrap.mjs';
import { type Unwrap } from './types.mjs';

/**
 * Unwraps an `Optional`, returning the contained value or throwing an error
 * with the provided message.
 *
 * @example
 *
 * ```ts
 * const optionalValue = Optional.some('data');
 *
 * assert(Optional.expectToBe(optionalValue, 'value expected') === 'data');
 *
 * const expectValue = Optional.expectToBe<string>('missing optional');
 *
 * assert.throws(() => expectValue(Optional.none), /missing optional/u);
 *
 * assert(expectValue(Optional.some('present')) === 'present');
 * ```
 *
 * @template O The `UnknownOptional` type to unwrap.
 * @param optional The `Optional` to unwrap.
 * @param message The error message to throw if the `Optional` is
 *   `None`.
 * @returns The contained value if `Some`.
 * @throws Error with the provided message if the `Optional` is
 *   `None`.
 */
export function expectToBe<O extends UnknownOptional>(
  optional: O,
  message: string,
): Unwrap<O>;

// Curried version
export function expectToBe<S>(message: string): (optional: Optional<S>) => S;

export function expectToBe<O extends UnknownOptional>(
  ...args: readonly [optional: O, message: string] | readonly [message: string]
): Unwrap<O> | ((optional: Optional<Unwrap<O>>) => Unwrap<O>) {
  switch (args.length) {
    case 2: {
      const [optional, message] = args;

      return expectToBeImpl(optional, message);
    }

    case 1: {
      // Curried version: first argument is message
      const [message] = args;

      return (optional: Optional<Unwrap<O>>): Unwrap<O> =>
        expectToBeImpl(optional, message);
    }
  }
}

const expectToBeImpl = <O extends UnknownOptional>(
  optional: O,
  message: string,
): Unwrap<O> => {
  if (isSome(optional)) {
    return unwrap(optional);
  }

  throw new Error(message);
};
