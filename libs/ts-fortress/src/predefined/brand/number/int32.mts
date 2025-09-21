import { isInt32 } from 'ts-data-forge';
import { brand } from '../../../brand/index.mjs';
import { number } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const int32 = (defaultValue: number = 0): Type<Int32> =>
  brand({
    baseType: number(defaultValue),
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
    typeName: 'Int32',
  });
