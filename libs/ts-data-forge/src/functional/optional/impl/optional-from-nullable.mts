import { none } from './optional-none.mjs';
import { some } from './optional-some.mjs';

/**
 * Converts a nullable value to an `Optional`.
 *
 * This is the primary way to lift nullable values (null or undefined) into
 * the Optional type system. The function treats both `null` and `undefined`
 * as empty values, converting them to `None`.
 *
 * @example
 *
 * ```ts
 * const present = Optional.fromNullable('hello');
 *
 * const absent = Optional.fromNullable<string | null>(null);
 *
 * assert.deepStrictEqual(present, Optional.some('hello'));
 *
 * assert.deepStrictEqual(absent, Optional.none);
 * ```
 *
 * @template T The type of the nullable value.
 * @param value The nullable value to convert.
 * @returns `Some<NonNullable<T>>` if the value is not null or
 *   undefined, otherwise `None`.
 */
export const fromNullable = <T,>(
  value: T | null | undefined,
): Optional<NonNullable<T>> => (value == null ? none : some(value));
