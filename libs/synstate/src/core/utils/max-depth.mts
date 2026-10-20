import type { Observable } from '../types/index.mjs';

/** The greatest `depth` among `parents`, or 0 when there are none. */
export const maxDepth = (parents: readonly Observable<unknown>[]): number => {
  let mut_max = 0;

  for (const p of parents) {
    if (p.depth > mut_max) {
      mut_max = p.depth;
    }
  }

  return mut_max;
};
