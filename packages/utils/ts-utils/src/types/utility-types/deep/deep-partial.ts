import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { Primitive } from './primitive';

export type DeepPartial<T> = T extends Primitive
  ? T
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepPartial<K>, DeepPartial<V>>
  : T extends Set<infer V>
  ? ReadonlySet<DeepPartial<V>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object | readonly unknown[]
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

/* type test */

type Res1 = DeepPartial<{ a: { b: { c: number[]; 1: 2 } } }>;
type Expected1 = {
  a?: {
    b?: {
      c?: (number | undefined)[];
      1?: 2;
    };
  };
};
assertType<TypeEq<Res1, Expected1>>();

type Res2 = DeepPartial<{ a: { b: { c: [1, 2, 5] } } }>;
type Expected2 = {
  a?: {
    b?: {
      c?: [(1 | undefined)?, (2 | undefined)?, (5 | undefined)?] | undefined;
    };
  };
};

assertType<TypeEq<Res2, Expected2>>();
