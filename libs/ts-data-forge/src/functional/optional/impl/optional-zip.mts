import { isSome } from './optional-is-some.mjs';
import { none } from './optional-none.mjs';
import { some } from './optional-some.mjs';

/**
 * Combines two `Optional` values into a single `Optional` containing a tuple.
 * If either `Optional` is `None`, returns `None`.
 *
 * @example
 *
 * ```ts
 * const zipped = Optional.zip(Optional.some('left'), Optional.some(1));
 *
 * assert.isTrue(Optional.isSome(zipped));
 *
 * if (Optional.isSome(zipped)) {
 *   const expected: readonly [string, number] = ['left', 1] as const;
 *
 *   assert.deepStrictEqual(zipped.value, expected);
 * }
 *
 * const missing = Optional.zip(
 *   Optional.some('value'),
 *   Optional.none as Optional<number>,
 * );
 *
 * assert.deepStrictEqual(missing, Optional.none);
 * ```
 *
 * @template A The value type of the first `Optional`.
 * @template B The value type of the second `Optional`.
 * @param optionalA The first `Optional`.
 * @param optionalB The second `Optional`.
 * @returns An `Optional` containing a tuple of both values, or `None`.
 */
export const zip = <A, const B>(
  optionalA: Optional<A>,
  optionalB: Optional<B>,
): Optional<readonly [A, B]> =>
  isSome(optionalA) && isSome(optionalB)
    ? some([optionalA.value, optionalB.value] as const)
    : none;
