import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = (a: number): a is PositiveInt => Num.isPositive(a) && Num.isInt(a);

export const positiveInteger = (
  defaultValue: number = 1
): Type<PositiveInt> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be a positive integer');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'Int', 'NonNegative', 'NonZero'],
  } as const);
};
