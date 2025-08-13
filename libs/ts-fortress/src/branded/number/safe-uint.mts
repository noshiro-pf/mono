import { asSafeUint, isSafeUint } from 'ts-data-forge';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const safeUint = (
  defaultValue: SafeUint = asSafeUint(0),
): Type<SafeUint> =>
  brand({
    codec: number(defaultValue),
    is: isSafeUint,
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
    ],
    brandFalseKeys: ['NaNValue'],
  });
