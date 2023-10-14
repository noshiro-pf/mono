import { string } from '../primitives';
import { type Type } from '../type';
import { brand } from './brand';

export const simpleBrandedString = <S extends string>(
  typeName: S,
  defaultValue: string = '',
): Type<Brand<string, S>> =>
  brand({
    codec: string(defaultValue),
    // eslint-disable-next-line no-restricted-syntax
    defaultValue: defaultValue as Brand<string, S>,
    is: (_id: string): _id is Brand<string, S> => true,
    brandKeys: [typeName],
  });
