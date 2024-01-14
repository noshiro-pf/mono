import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

const is = Num.isNonZero;

export const nonZeroNumber = (
  defaultValue: number = 0,
): Type<NonZeroNumber> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be a non-zero number');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['!=0'],
    brandFalseKeys: ['NaNValue'],
  } as const);
};
