import type { None } from '../../../adt-types.mjs';
import { noneValue } from './encoding.mjs';

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
// eslint-disable-next-line total-functions/no-unsafe-type-assertion -- `None` is a type-only shape over the reserved string (see `encoding.mts`).
export const none: None = noneValue as unknown as None;
