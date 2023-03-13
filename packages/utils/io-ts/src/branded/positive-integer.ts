import { Num } from '@noshiro/ts-utils';
import { number } from '../primitives';
import { type Type } from '../type';
import { brand } from './brand';

const is = (a: number): a is PositiveInteger =>
  !Num.isNaN(a) && Num.isInt(a) && a > 0;

export const positiveInteger = (
  defaultValue: number = 1
): Type<PositiveInteger> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be a positive integer');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    typeName: 'PositiveInteger',
  });
};
