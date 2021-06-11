import type { ReadonlyRecordBase } from '../readonly-record-base';
import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';

export type DeepPartial<T> = T extends (...args: readonly unknown[]) => unknown
  ? T
  : T extends ReadonlyRecordBase | readonly unknown[]
  ? { [P in keyof T]?: DeepPartial<T[P]> }
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
