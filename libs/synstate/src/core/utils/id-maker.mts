import type { UpdateToken } from '../types/index.mjs';

/**
 * The token a node holds before its first update: one value shared by every
 * node of this copy, since no update is ever issued it, so creating a node
 * issues nothing.
 */
export const notUpdatedYet: UpdateToken =
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  Object.freeze({}) as UpdateToken;
