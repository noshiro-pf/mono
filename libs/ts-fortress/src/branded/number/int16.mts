import { asInt16, isInt16 } from 'ts-data-forge';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const int16 = (defaultValue: Int16 = asInt16(0)): Type<Int16> =>
  brand({
    codec: number(defaultValue),
    is: isInt16,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '> -2^32',
      '>= -2^31',
      '< 2^32',
      '< 2^31',
      '< 2^15',
      '< 2^16',
      '> -2^16',
      '>= -2^15',
    ],
    brandFalseKeys: ['NaNValue'],
  });
