import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

const is = Number.isInteger;

export const int = (defaultValue: number = 0): Type<Int> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be an integer');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'Int'],
    brandFalseKeys: ['NaNValue'],
  } as const);
};
