import { PositiveSafeInt } from 'ts-data-forge';
import { skipWhile } from '../../operators/index.mjs';
import { type DropInitialValueOperator } from '../../types/index.mjs';

export const skip = <A,>(
  n: PositiveSafeIntWithSmallInt,
): DropInitialValueOperator<A, A> =>
  !PositiveSafeInt.is(n) ? idFn : skipWhile((_, index) => index + 1 <= n);

const idFn = <T,>(value: T): T => value;
