import { number } from '../primitives';
import { type Type } from '../type';
import { brand } from './brand';

export const simpleBrandedNumber = <S extends string>(
  typeName: S,
  defaultValue: number = 0
): [Type<Phantomic<number, S>>, (a: number) => Phantomic<number, S>] => {
  const b = brand({
    codec: number(defaultValue),
    defaultValue: defaultValue as Phantomic<number, S>,
    is: (_id: number): _id is Phantomic<number, S> => true,
    typeName,
  });

  return [b, b.fill];
};
