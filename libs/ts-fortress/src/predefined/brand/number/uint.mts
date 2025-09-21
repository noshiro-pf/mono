import { isUint } from 'ts-data-forge';
import { brand } from '../../../brand/index.mjs';
import { number } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const uint = (defaultValue: number = 0): Type<Uint> =>
  brand({
    baseType: number(defaultValue),
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
    typeName: 'Uint',
  });
