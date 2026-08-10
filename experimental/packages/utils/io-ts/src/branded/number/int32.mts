import { isInt32, toInt32 } from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const int32 = (defaultValue: Int32 = toInt32(0)): Type<Int32> =>
  brand({
    codec: number(defaultValue),
    is: isInt32,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '> -2^32',
      '>= -2^31',
      '< 2^32',
      '< 2^31',
    ],
    brandFalseKeys: ['NaNValue'],
  });
