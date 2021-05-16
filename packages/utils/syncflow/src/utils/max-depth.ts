import type { Observable } from '../types';

export const maxDepth = (parents: readonly Observable<unknown>[]): number =>
  parents.reduce((mx, a) => Math.max(mx, a.depth), 0);
