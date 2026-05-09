import { isInt16 } from 'ts-data-forge';
import { type Int16 } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import { number } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const int16 = (defaultValue: number = 0): Type<Int16> =>
  brand({
    baseType: number(defaultValue),
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
    typeName: 'Int16',
  });
