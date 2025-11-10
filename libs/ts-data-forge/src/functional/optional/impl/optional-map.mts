import { isSome } from './optional-is-some.mjs';
import { none } from './optional-none.mjs';
import { some } from './optional-some.mjs';
import { unwrap } from './optional-unwrap.mjs';
import { type Unwrap } from './types.mjs';

/**
 * Maps an {@link Optional}<S> to {@link Optional}<S2> by applying a function to
 * a contained value. If the {@link Optional} is {@link None}, it
 * returns {@link Optional.none}. Otherwise, it applies the `mapFn` to the
 * value in `Some` and returns a new `Some` with the result.
 *
 * @example
 *
 * ```ts
 * const numberOptional = Optional.some(21);
 * const mapped = Optional.map(numberOptional, (value) => value * 2);
 *
 * assert.deepStrictEqual(mapped, Optional.some(42));
 *
 * const mapToLength = Optional.map((text: string) => text.length);
 *
 * assert.deepStrictEqual(mapToLength(Optional.some('abc')), Optional.some(3));
 * assert.deepStrictEqual(mapToLength(Optional.none), Optional.none);
 * ```
 *
 * @template O The input `UnknownOptional` type.
 * @template S2 The type of the value returned by the mapping function.
 * @param optional The `Optional` to map.
 * @param mapFn The function to apply to the value if it exists.
 * @returns A new `Optional<S2>` resulting from the mapping, or
 *   `None` if the input was `None`.
 */
export function map<O extends UnknownOptional, S2>(
  optional: O,
  mapFn: (value: Unwrap<O>) => S2,
): Optional<S2>;

// Curried version
export function map<S, S2>(
  mapFn: (value: S) => S2,
): (optional: Optional<S>) => Optional<S2>;

export function map<O extends UnknownOptional, S2>(
  ...args:
    | readonly [optional: O, mapFn: (value: Unwrap<O>) => S2]
    | readonly [mapFn: (value: Unwrap<O>) => S2]
): Optional<S2> | ((optional: O) => Optional<S2>) {
  switch (args.length) {
    case 2: {
      const [optional, mapFn] = args;
      return mapImpl(optional, mapFn);
    }
    case 1: {
      // Curried version: first argument is mapping function
      const [mapFn] = args;
      return (optional: O) => mapImpl(optional, mapFn);
    }
  }
}

const mapImpl = <O extends UnknownOptional, S2>(
  optional: O,
  mapFn: (value: Unwrap<O>) => S2,
): Optional<S2> =>
  isSome(optional)
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      some(mapFn(unwrap(optional)!))
    : none;
