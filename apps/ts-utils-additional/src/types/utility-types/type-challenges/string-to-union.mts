import { expectType } from 'ts-data-forge';

export type StringToUnion<S extends string> =
  S extends `${infer Head}${infer Rest}` ? Head | StringToUnion<Rest> : never;

expectType<StringToUnion<'123'>, '1' | '2' | '3'>('=');
