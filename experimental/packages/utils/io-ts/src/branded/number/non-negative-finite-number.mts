import {
  isNonNegativeFiniteNumber,
  toNonNegativeFiniteNumber,
} from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const nonNegativeFiniteNumber = (
  defaultValue: NonNegativeFiniteNumber = toNonNegativeFiniteNumber(0),
): Type<NonNegativeFiniteNumber> =>
  brand({
    codec: number(defaultValue),
    is: isNonNegativeFiniteNumber,
    defaultValue,
    brandKeys: ['>=0', '> -2^16', '> -2^32', '>= -2^15', '>= -2^31', 'Finite'],
    brandFalseKeys: ['NaNValue'],
  });
