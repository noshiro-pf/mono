import { string } from '../primitives';
import { type Type } from '../type';
import { brand } from './brand';

export const simpleBrandedString = <S extends string>(
  typeName: S,
  defaultValue: string = ''
): [Type<Brand<string, S>>, (a: string) => Brand<string, S>] => {
  const b = brand({
    codec: string(defaultValue),
    defaultValue: defaultValue as Brand<string, S>,
    is: (_id: string): _id is Brand<string, S> => true,
    brandKeys: [typeName],
  });

  return [b, b.fill];
};
