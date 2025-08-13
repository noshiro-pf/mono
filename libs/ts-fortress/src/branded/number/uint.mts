import { asUint, isUint } from 'ts-data-forge';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const uint = (defaultValue: Uint = asUint(0)): Type<Uint> =>
  brand({
    codec: number(defaultValue),
    is: isUint,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      '> -2^32',
      '>= -2^31',
      '> -2^16',
      '>= -2^15',
      '>=0',
    ],
    brandFalseKeys: ['NaNValue'],
  });
