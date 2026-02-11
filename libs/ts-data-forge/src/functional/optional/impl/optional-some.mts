import { SomeTypeTagName } from './tag.mjs';

/**
 * Creates an {@link Some} containing the given value.
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
  ({
    $$tag: SomeTypeTagName,
    value,
  }) as const;
