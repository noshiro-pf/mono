import type { ReadonlyRecordBase } from '../readonly-record-base';
import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';

export type DeepWritable<T> = T extends (...args: readonly unknown[]) => unknown
  ? T
  : T extends ReadonlyRecordBase | readonly unknown[]
  ? { -readonly [P in keyof T]: DeepWritable<T[P]> }
  : T;

/* type test */

type Res1 = DeepWritable<{
  readonly a: {
    readonly b: {
      readonly c: [1, 2, 3];
      readonly d: (xs: readonly number[]) => number;
      readonly 1: 2;
    };
  };
}>;
type Expected1 = {
  a: {
    b: {
      c: [1, 2, 3];
      d: (xs: readonly number[]) => number;
      1: 2;
    };
  };
};
assertType<TypeEq<Res1, Expected1>>();

type Res2 = DeepWritable<{
  readonly a: { readonly b: { readonly c: readonly [1, 2, 5] } };
}>;
type Expected2 = {
  a: {
    b: {
      c: [1, 2, 5];
    };
  };
};
assertType<TypeEq<Res2, Expected2>>();
