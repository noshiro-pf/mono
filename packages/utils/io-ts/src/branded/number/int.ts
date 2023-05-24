import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

const is = Number.isInteger as (u: number) => u is IntBrand;

export const int = (defaultValue: number = 0): Type<Int> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be an integer');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'Int'],
    brandFalseKeys: ['NaN'],
  } as const);
};
