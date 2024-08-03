import { Num } from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

const is = (a: number): a is NonZeroInt =>
  Number.isInteger(a) && Num.isNonZero(a);

export const nonZeroInt = (
  // eslint-disable-next-line no-restricted-syntax
  defaultValue: NonZeroInt = 0 as NonZeroInt,
): Type<NonZeroInt> =>
  brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'Int', '!=0'],
    brandFalseKeys: ['NaNValue'],
  } as const);
