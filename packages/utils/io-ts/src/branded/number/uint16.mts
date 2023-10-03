import { isUint16, toUint16 } from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const uint16 = (defaultValue: Uint16 = toUint16(0)): Type<Uint16> =>
  brand({
    codec: number(defaultValue),
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
  } as const);
