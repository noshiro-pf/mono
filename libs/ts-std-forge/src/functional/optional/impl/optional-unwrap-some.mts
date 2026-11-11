import type { UnknownOptional } from '../optional.mjs';
import { decodeSome } from './encoding.mjs';
import type { NarrowToSome, Unwrap } from './types.mjs';

/**
 * The value a `Some` holds. Internal: the combinators call it once `isSome` has
 * narrowed their argument, so that the value is decoded without `unwrap`
 * checking for `None` a second time. Not exported from the package.
 */
export const unwrapSome = <O extends UnknownOptional>(
  some: NarrowToSome<O>,
): Unwrap<O> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a Some's runtime value decodes to the value it holds
  decodeSome(some) as Unwrap<O>;
