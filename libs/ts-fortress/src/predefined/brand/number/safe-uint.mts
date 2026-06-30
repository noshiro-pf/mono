import { isSafeUint } from 'ts-data-forge';
import { type SafeUint } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const safeUint = (
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): Type<SafeUint> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
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
    typeName: 'SafeUint',
  });
