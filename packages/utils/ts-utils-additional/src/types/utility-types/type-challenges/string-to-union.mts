import { expectType } from '@noshiro/ts-utils';

export type StringToUnion<S extends string> =
  S extends `${infer Head}${infer Rest}` ? Head | StringToUnion<Rest> : never;

expectType<StringToUnion<'123'>, '1' | '2' | '3'>('=');
