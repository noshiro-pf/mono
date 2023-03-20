import { string } from '../primitives';
import { type Type } from '../type';
import { brand } from './brand';

export const simpleBrandedString = <S extends string>(
  typeName: S,
  defaultValue: string = ''
): [Type<Phantomic<string, S>>, (a: string) => Phantomic<string, S>] => {
  const b = brand({
    codec: string(defaultValue),
    defaultValue: defaultValue as Phantomic<string, S>,
    is: (_id: string): _id is Phantomic<string, S> => true,
    typeName,
  });

  return [b, b.fill];
};
