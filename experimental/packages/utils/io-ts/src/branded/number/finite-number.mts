import { toFiniteNumber } from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const finiteNumber = (
  defaultValue: FiniteNumber = toFiniteNumber(0),
): Type<FiniteNumber> =>
  brand({
    codec: number(defaultValue),
    is: Number.isFinite,
    defaultValue,
    brandKeys: ['Finite'],
    brandFalseKeys: ['NaNValue'],
  });
