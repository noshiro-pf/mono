import { number } from '../primitives';
import { type Type } from '../type';
import { brand } from './brand';

export const simpleBrandedNumber = <S extends string>(
  typeName: S,
  defaultValue: number = 0,
): Type<Brand<number, S>> =>
  brand({
    codec: number(defaultValue),
    // eslint-disable-next-line no-restricted-syntax
    defaultValue: defaultValue as Brand<number, S>,
    is: (_id: number): _id is Brand<number, S> => true,
    brandKeys: [typeName],
  });
