import { isUint16 } from 'ts-data-forge';
import { type Uint16 } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import { number } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const uint16 = (defaultValue: number = 0): Type<Uint16> =>
  brand({
    baseType: number(defaultValue),
    is: isUint16,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '> -2^16',
      '> -2^32',
      '>= -2^15',
      '>= -2^31',
      '>=0',
      '< 2^32',
      '< 2^16',
      '< 2^31',
    ],
    brandFalseKeys: ['NaNValue'],
    typeName: 'Uint16',
  });
