import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

const is = Number.isSafeInteger;

export const safeInt = (defaultValue: number = 0): Type<SafeInt> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be a safe integer');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    brandKeys: ['Finite', 'Int', 'SafeInt'],
    brandFalseKeys: ['NaNValue'],
  } as const);
};
