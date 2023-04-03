import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = (a: number): a is NonZeroInt => Num.isInt(a) && Num.isNonZero(a);

export const nonZeroInt = (defaultValue: number = 0): Type<NonZeroInt> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be a finite number');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'NonZero', 'Int'],
  } as const);
};
