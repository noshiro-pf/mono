import { number } from '../../primitives';
import { type Type } from '../../type';
import { brand } from '../brand';

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
    brandFalseKeys: ['NaN'],
  } as const);
};
