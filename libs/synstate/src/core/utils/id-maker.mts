import type { UpdateToken } from '../types/index.mjs';

/**
 * The token of a new update, which the update's root or async child passes to
 * every node it reaches. A `Symbol` with no description, issued once per
 * update and never per node, so its cost is spread over every node the
 * update reaches. Unique without any counter, so the tokens of two copies of
 * synstate in one program never coincide, and nothing is kept in a global.
 */
export const issueUpdateToken = (): UpdateToken =>
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  Symbol() as UpdateToken;

/**
 * The token a node holds before its first update: one value shared by every
 * node of this copy, since no update is ever issued it, so creating a node
 * issues nothing.
 */
export const notUpdatedYet: UpdateToken =
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  Symbol('synstate/not-updated-yet') as UpdateToken;
