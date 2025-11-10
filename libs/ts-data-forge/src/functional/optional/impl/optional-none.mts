import { NoneTypeTagName } from './tag.mjs';

/**
 * The singleton instance representing {@link None} (an empty
 * Optional).
 *
 * @example
 *
 * ```ts
 * const someValue = Optional.some({ id: 1 });
 * const noneValue = Optional.none;
 *
 * assert.ok(Optional.isSome(someValue));
 * assert.ok(Optional.isNone(noneValue));
 * ```
 */
export const none: None = { $$tag: NoneTypeTagName } as const;
