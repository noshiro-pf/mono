import {
  isPositiveFiniteNumber,
  toPositiveFiniteNumber,
} from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const positiveFiniteNumber = (
  defaultValue: PositiveFiniteNumber = toPositiveFiniteNumber(0),
): Type<PositiveFiniteNumber> =>
  brand({
    codec: number(defaultValue),
    is: isPositiveFiniteNumber,
    defaultValue,
    brandKeys: [
      '>=0',
      '> -2^16',
      '> -2^32',
      '>= -2^15',
      '>= -2^31',
      'Finite',
      '!=0',
    ],
    brandFalseKeys: ['NaNValue'],
  } as const);
