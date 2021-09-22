import { assertType } from '../test-type';

export type StringToUnion<S extends string> =
  S extends `${infer Head}${infer Rest}` ? Head | StringToUnion<Rest> : never;

assertType<TypeEq<StringToUnion<'123'>, '1' | '2' | '3'>>();
