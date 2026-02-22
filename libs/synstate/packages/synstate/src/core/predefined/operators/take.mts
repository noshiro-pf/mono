import { takeWhile } from '../../operators/index.mjs';
import { type DropInitialValueOperator } from '../../types/index.mjs';

export const take = <A,>(
  n: PositiveSafeIntWithSmallInt,
): DropInitialValueOperator<A, A> => takeWhile((_, index) => index + 1 <= n);
