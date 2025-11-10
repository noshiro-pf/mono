import { isSome } from './optional-is-some.mjs';
import { none } from './optional-none.mjs';
import { unwrap } from './optional-unwrap.mjs';
import { type Unwrap } from './types.mjs';

/**
 * Applies a function that returns an `Optional` to the value in an
 * `Some`. If the input is `None`, returns `None`.
 * This is the monadic bind operation for `Optional`.
 *
 * @example
 *
 * ```ts
 * const parseNumber = (input: string): Optional<number> => {
 *   const num = Number.parseInt(input, 10);
 *   return Number.isNaN(num) ? Optional.none : Optional.some(num);
 * };
 *
 * const parsed = Optional.flatMap(Optional.some('10'), parseNumber);
 *
 * assert.deepStrictEqual(parsed, Optional.some(10));
 *
 * const flatMapParse = Optional.flatMap(parseNumber);
 *
 * assert.deepStrictEqual(flatMapParse(Optional.some('5')), Optional.some(5));
 * assert.deepStrictEqual(flatMapParse(Optional.some('invalid')), Optional.none);
 * ```
 *
 * @template O The input `UnknownOptional` type.
 * @template S2 The value type of the `Optional` returned by the function.
 * @param optional The `Optional` to flat map.
 * @param flatMapFn The function to apply that returns an `Optional`.
 * @returns The result of applying the function, or `None`.
 */
export function flatMap<O extends UnknownOptional, S2>(
  optional: O,
  flatMapFn: (value: Unwrap<O>) => Optional<S2>,
): Optional<S2>;

// Curried version
export function flatMap<S, S2>(
  flatMapFn: (value: S) => Optional<S2>,
): (optional: Optional<S>) => Optional<S2>;

export function flatMap<O extends UnknownOptional, S2>(
  ...args:
    | readonly [optional: O, flatMapFn: (value: Unwrap<O>) => Optional<S2>]
    | readonly [flatMapFn: (value: Unwrap<O>) => Optional<S2>]
): Optional<S2> | ((optional: O) => Optional<S2>) {
  switch (args.length) {
    case 2: {
      const [optional, flatMapFn] = args;
      return flatMapImpl(optional, flatMapFn);
    }

    case 1: {
      // Curried version
      const [flatMapFn] = args;
      return (optional: O) => flatMapImpl(optional, flatMapFn);
    }
  }
}

const flatMapImpl = <O extends UnknownOptional, S2>(
  optional: O,
  flatMapFn: (value: Unwrap<O>) => Optional<S2>,
): Optional<S2> => (isSome(optional) ? flatMapFn(unwrap(optional)) : none);
