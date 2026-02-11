import { hasKey, isRecord } from '../../../guard/index.mjs';
import { NoneTypeTagName, SomeTypeTagName } from './tag.mjs';

/**
 * Checks if the given value is an {@link Optional}.
 *
 * @example
 *
 * ```ts
 * const maybeOptional = Optional.some('value');
 *
 * const notOptional = { $$tag: 'ts-data-forge::Optional.some' } as const;
 *
 * assert.isTrue(Optional.isOptional(maybeOptional));
 *
 * assert.isFalse(Optional.isOptional(notOptional));
 * ```
 *
 * @param maybeOptional The value to check.
 * @returns `true` if the value is an {@link Optional}, otherwise `false`.
 */
export const isOptional = (
  maybeOptional: unknown,
): maybeOptional is Optional<unknown> =>
  isRecord(maybeOptional) &&
  hasKey(maybeOptional, '$$tag') &&
  ((maybeOptional.$$tag === SomeTypeTagName &&
    hasKey(maybeOptional, 'value')) ||
    maybeOptional.$$tag === NoneTypeTagName);
