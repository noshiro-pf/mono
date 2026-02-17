import { Arr, Optional, pipe } from 'ts-data-forge';
import { type Observable } from '../types/index.mjs';

export const maxDepth = (parents: readonly Observable<unknown>[]): number =>
  pipe(Arr.maxBy(parents, (p) => p.depth))
    .mapOptional((o) => o.depth)
    .map(Optional.unwrapOr(0)).value;
