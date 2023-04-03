import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = Num.isNonZero;

export const nonZeroNumber = (
  defaultValue: number = 0
): Type<NonZeroNumber> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be a finite number');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'NonZero'],
  } as const);
};
