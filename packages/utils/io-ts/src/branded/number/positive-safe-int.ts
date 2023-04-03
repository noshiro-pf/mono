import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = (a: number): a is PositiveInt32 =>
  Num.isSafeInt(a) && Num.isPositive(a);

export const positiveSafeInt = (
  defaultValue: number = 0
): Type<PositiveSafeInt> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be an integer');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'NonZero', 'NonNegative', 'Int', 'SafeInt'],
  } as const);
};
