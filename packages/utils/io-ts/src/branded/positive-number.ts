import { Num } from '@noshiro/ts-utils';
import { number } from '../primitives';
import { type Type } from '../type';
import { brand } from './brand';

const is = (a: number): a is PositiveNumber => !Num.isNaN(a) && a > 0;

export const positiveNumber = (
  defaultValue: number = 1
): Type<PositiveNumber> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be a positive number');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    typeName: 'PositiveNumber',
  });
};
