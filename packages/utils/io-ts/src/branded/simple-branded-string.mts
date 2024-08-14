import { string } from '../primitives/index.mjs';
import { type Type } from '../type.mjs';
import { brand } from './brand.mjs';

export const simpleBrandedString = <S extends string>(
  typeName: S,
  defaultValue: string = '',
): Type<Brand<string, S>> =>
  brand({
    codec: string(defaultValue),

    defaultValue:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      defaultValue as Brand<string, S>,

    is: (_id: string): _id is Brand<string, S> => true,
    brandKeys: [typeName],
  });
