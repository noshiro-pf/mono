import { Arr, Optional, pipe } from 'ts-data-forge';
import { type Observable } from '../types/index.mjs';

export const maxDepth = (parents: readonly Observable<unknown>[]): number =>
  pipe(Arr.maxBy(parents, (p) => p.depth))
    // Explicit return type + non-curried `Optional.unwrapOr` call: TypeScript
    // 7 (native)'s inference for this chained generic call resolves to
    // `unknown` without them, even though TypeScript <= 6.0's checker
    // resolves this fine.
    .mapOptional((o): number => o.depth)
    .map((o) => Optional.unwrapOr(o, 0)).value;
