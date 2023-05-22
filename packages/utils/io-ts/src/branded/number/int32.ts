import { isInt32 } from '@noshiro/ts-utils';
import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = isInt32;

export const int32 = (defaultValue: number = 0): Type<Int32> => {
  if (!is(defaultValue)) {
    throw new Error(
      'defaultValue must be a integer in the range of 32-bit signed'
    );
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'Int', 'SafeInt', 'Int32'],
    brandFalseKeys: ['NaN'],
  } as const);
};
