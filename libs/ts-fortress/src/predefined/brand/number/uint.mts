import { isUint } from 'ts-data-forge';
import { type Uint } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const uint = (
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): Type<Uint> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
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
