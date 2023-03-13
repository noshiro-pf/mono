import { Num } from '@noshiro/ts-utils';
import { number } from '../primitives';
import { type Type } from '../type';
import { brand } from './brand';

const is = (a: number): a is NonNegativeNumber => !Num.isNaN(a) && a >= 0;

export const nonNegativeNumber = (
  defaultValue: number = 0
): Type<NonNegativeNumber> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be a non-negative number');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    typeName: 'NonNegativeNumber',
  });
};
