import type { Some } from '../../../adt-types.mjs';
import { encodeSome } from './encoding.mjs';

/**
 * Creates an {@link Some} containing the given value.
 *
 * The value is not copied into an object: a `Some` is that value itself at
 * runtime, falsy and nullish values included, so
 * `Optional.some(Optional.some(5))` and `Optional.some(5)` are the same runtime
 * value, and `Optional.some(undefined)` is `undefined`. Only a string that
 * starts with the prefix `None` is made of is rewritten, so that `Some(None)`
 * is not `None`. `Optional.unwrap(Optional.some(x))` is `x` whatever `x` is.
 *
 * @example
 *
 * ```ts
 * const someValue = Optional.some({ id: 1 });
 *
 * const noneValue = Optional.none;
 *
 * assert.isTrue(Optional.isSome(someValue));
 *
 * assert.isTrue(Optional.isNone(noneValue));
 * ```
 *
 * @template S The type of the value.
 * @param value The value to wrap in an {@link Some}.
 * @returns An {@link Some}<S> containing the value.
 */
export const some = <const S,>(value: S): Some<S> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- `Some` is a type-only shape over the value itself (see `encoding.mts`).
  encodeSome(value) as Some<S>;
