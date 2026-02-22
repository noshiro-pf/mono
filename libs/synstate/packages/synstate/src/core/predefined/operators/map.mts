import { mapWithIndex } from '../../operators/index.mjs';
import { type KeepInitialValueOperator } from '../../types/index.mjs';

export const map = <A, B>(mapFn: (x: A) => B): KeepInitialValueOperator<A, B> =>
  mapWithIndex(mapFn);
