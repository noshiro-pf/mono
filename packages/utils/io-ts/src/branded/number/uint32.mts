import { isUint32, toUint32 } from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const uint32 = (defaultValue: Uint32 = toUint32(0)): Type<Uint32> =>
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
  } as const);
