import { isUint32 } from 'ts-data-forge';
import { type Uint32 } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const uint32 = (
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): Type<Uint32> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
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
    typeName: 'Uint32',
  });
