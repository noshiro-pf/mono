import {
  isNonZeroFiniteNumber,
  toNonZeroFiniteNumber,
} from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const nonZeroFiniteNumber = (
  defaultValue: NonZeroFiniteNumber = toNonZeroFiniteNumber(0),
): Type<NonZeroFiniteNumber> =>
  brand({
    codec: number(defaultValue),
    is: isNonZeroFiniteNumber,
    defaultValue,
    brandKeys: ['!=0', 'Finite'],
    brandFalseKeys: ['NaNValue'],
  } as const);
