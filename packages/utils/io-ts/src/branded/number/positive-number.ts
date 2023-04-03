import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = Num.isPositive;

export const positiveNumber = (
  defaultValue: number = 1
): Type<PositiveNumber> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be a positive number');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'NonNegative', 'NonZero'],
  } as const);
};
