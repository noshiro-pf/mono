import type { Href } from '../href.mjs';

/** The one place an {@link Href} is made from a string. */
export const toHref = (path: string): Href =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- callers have resolved `path` against the route tree
  path as Href;
