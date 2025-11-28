import { NoneTypeTagName } from './tag.mjs';

/**
 * The singleton instance representing {@link None} (an empty
 * Optional).
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
 */
export const none: None = { $$tag: NoneTypeTagName } as const;
