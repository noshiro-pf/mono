import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = (a: number): a is PositiveInt32 =>
  Num.isInt32(a) && Num.isPositive(a);

export const positiveInt32 = (
  defaultValue: number = 0
): Type<PositiveInt32> => {
  if (!is(defaultValue)) {
    throw new Error(
      'defaultValue must be a integer in the range of 32-bit signed'
    );
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'NonZero', 'Int', 'SafeInt', 'NonNegative', 'Int32'],
  } as const);
};
