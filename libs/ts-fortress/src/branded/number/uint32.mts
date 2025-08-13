import { asUint32, isUint32 } from 'ts-data-forge';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const uint32 = (defaultValue: Uint32 = asUint32(0)): Type<Uint32> =>
  brand({
    codec: number(defaultValue),
    is: isUint32,
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
    ],
    brandFalseKeys: ['NaNValue'],
  });
