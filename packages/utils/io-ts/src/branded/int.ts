import { Num } from '@noshiro/ts-utils';
import { number } from '../primitives';
import { type Type } from '../type';
import { brand } from './brand';

const is = (a: number): a is Int => !Num.isNaN(a) && Num.isInt(a);

export const int = (defaultValue: number = 0): Type<Int> => {
  if (!is(defaultValue)) {
    throw new Error('defaultValue must be an integer');
  }

  return brand({
    codec: number(defaultValue),
    is,
    defaultValue,
    typeName: 'Int',
  });
};
