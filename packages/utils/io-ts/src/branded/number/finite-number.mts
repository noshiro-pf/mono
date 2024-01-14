import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

const is = Number.isFinite;

export const finiteNumber = (defaultValue: number = 0): Type<FiniteNumber> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be a finite number');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite'],
    brandFalseKeys: ['NaNValue'],
  } as const);
};
