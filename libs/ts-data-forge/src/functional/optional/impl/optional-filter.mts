import { isSome } from './optional-is-some.mjs';
import { none } from './optional-none.mjs';
import { some } from './optional-some.mjs';
import { unwrap } from './optional-unwrap.mjs';
import { type Unwrap } from './types.mjs';

/**
 * Filters an `Optional` based on a predicate. If the `Optional` is `Some` and
 * the predicate returns true, returns the original `Optional`. Otherwise
 * returns `None`.
 *
 * @example
 *
 * ```ts
 * const even = Optional.filter(Optional.some(4), (value) => value % 2 === 0);
 *
 * const odd = Optional.filter(Optional.some(3), (value) => value % 2 === 0);
 *
 * assert.deepStrictEqual(even, Optional.some(4));
 *
 * assert.deepStrictEqual(odd, Optional.none);
 *
 * const filterEven = Optional.filter((value: number) => value % 2 === 0);
 *
 * assert.deepStrictEqual(filterEven(Optional.some(6)), Optional.some(6));
 *
 * assert.deepStrictEqual(filterEven(Optional.some(5)), Optional.none);
 * ```
 *
 * @template O The input `UnknownOptional` type.
 * @param optional The `Optional` to filter.
 * @param predicate The predicate function.
 * @returns The filtered `Optional`.
 */
export function filter<O extends UnknownOptional>(
  optional: O,
  predicate: (value: Unwrap<O>) => boolean,
): Optional<Unwrap<O>>;

// Curried version
export function filter<S>(
  predicate: (value: S) => boolean,
): (optional: Optional<S>) => Optional<S>;

export function filter<O extends UnknownOptional>(
  ...args:
    | readonly [optional: O, predicate: (value: Unwrap<O>) => boolean]
    | readonly [predicate: (value: Unwrap<O>) => boolean]
): Optional<Unwrap<O>> | ((optional: O) => Optional<Unwrap<O>>) {
  switch (args.length) {
    case 2: {
      const [optional, predicate] = args;

      return filterImpl(optional, predicate);
    }

    case 1: {
      // Curried version: first argument is predicate function
      const [predicate] = args;

      return (optional: O) => filterImpl(optional, predicate);
    }
  }
}

const filterImpl = <O extends UnknownOptional>(
  optional: O,
  predicate: (value: Unwrap<O>) => boolean,
): Optional<Unwrap<O>> => {
  if (isSome(optional)) {
    const value = unwrap(optional);

    return predicate(value) ? some(value) : none;
  }

  return none;
};
