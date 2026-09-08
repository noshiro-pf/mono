import { type UnknownOptional } from '../optional.mjs';
import { isSome } from './optional-is-some.mjs';
import { unwrap } from './optional-unwrap.mjs';
import { type Unwrap } from './types.mjs';

/**
 * Folds an {@link Optional} into a plain value by applying one of two case
 * handlers: `some` if the {@link Optional} contains a value, `none`
 * otherwise. This is the function form of pattern matching on an
 * {@link Optional}.
 *
 * Unlike {@link Optional.map}, the result is not wrapped in an
 * {@link Optional} — both branches produce the final value directly.
 *
 * @example
 *
 * ```ts
 * const doubledOrZero = Optional.match(Optional.some(21), {
 *   some: (value) => value * 2,
 *   none: () => 0,
 * });
 *
 * assert.deepStrictEqual(doubledOrZero, 42);
 *
 * const matcher = Optional.match({
 *   some: (value: number) => `value: ${value}`,
 *   none: () => 'none',
 * });
 *
 * assert.deepStrictEqual(matcher(Optional.some(3)), 'value: 3');
 *
 * assert.deepStrictEqual(matcher(Optional.none), 'none');
 * ```
 *
 * @template O The input `UnknownOptional` type.
 * @template S2 The type returned by the `some` case.
 * @template N2 The type returned by the `none` case.
 * @param optional The `Optional` to match on.
 * @param cases An object with a `some` handler receiving the contained value
 *   and a `none` handler receiving nothing.
 * @returns The value produced by whichever case handler was applied.
 */
export function match<O extends UnknownOptional, S2, N2>(
  optional: O,
  cases: Readonly<{
    some: (value: Unwrap<O>) => S2;
    none: () => N2;
  }>,
): N2 | S2;

// Curried version
//
// The returned function is generic over the *whole* optional, mirroring the
// direct overload above; see the comment on the curried overload of
// `Optional.map` for why the parameter is a conditional type instead of a
// plain `Optional<S>`.
export function match<S, S2, N2>(
  cases: Readonly<{
    some: (value: S) => S2;
    none: () => N2;
  }>,
): <O extends UnknownOptional>(
  optional: Unwrap<O> extends S ? O : never,
) => N2 | S2;

export function match<O extends UnknownOptional, S2, N2>(
  ...args:
    | readonly [
        optional: O,
        cases: Readonly<{
          some: (value: Unwrap<O>) => S2;
          none: () => N2;
        }>,
      ]
    | readonly [
        cases: Readonly<{
          some: (value: Unwrap<O>) => S2;
          none: () => N2;
        }>,
      ]
): N2 | S2 | ((optional: O) => N2 | S2) {
  switch (args.length) {
    case 2: {
      const [optional, cases] = args;

      return matchImpl(optional, cases);
    }

    case 1: {
      // Curried version: the only argument is the case handlers
      const [cases] = args;

      return (optional: O) => matchImpl(optional, cases);
    }
  }
}

const matchImpl = <O extends UnknownOptional, S2, N2>(
  optional: O,
  cases: Readonly<{
    some: (value: Unwrap<O>) => S2;
    none: () => N2;
  }>,
): N2 | S2 =>
  isSome(optional)
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      cases.some(unwrap(optional)!)
    : cases.none();
