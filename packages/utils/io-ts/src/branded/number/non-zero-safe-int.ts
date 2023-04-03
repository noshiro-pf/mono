import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = (a: number): a is NonZeroSafeInt =>
  Num.isSafeInt(a) && Num.isNonZero(a);

export const nonZeroSafeInt = (
  defaultValue: number = 0
): Type<NonZeroSafeInt> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be an integer');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'Int', 'SafeInt', 'NonZero'],
  } as const);
};
