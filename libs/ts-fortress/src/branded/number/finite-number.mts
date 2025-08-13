import { asFiniteNumber, FiniteNumber } from 'ts-data-forge';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const finiteNumber = (
  defaultValue: FiniteNumber = asFiniteNumber(0),
): Type<FiniteNumber> =>
  brand({
    codec: number(defaultValue),
    is: FiniteNumber.is,
    defaultValue,
    brandKeys: ['Finite'],
    brandFalseKeys: ['NaNValue'],
  });
