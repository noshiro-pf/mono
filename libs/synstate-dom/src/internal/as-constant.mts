import type { Constant } from '../constant/index.mjs';

/**
 * The one type assertion in the library. `Constant<T>` is a brand that exists
 * only in the type system, so marking a value as one changes nothing at run
 * time; this is what {@link constant} and the helpers that derive one constant
 * from another call.
 */
export const asConstant = <T,>(value: T): Constant<T> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a brand has no run-time part to check
  value as Constant<T>;
