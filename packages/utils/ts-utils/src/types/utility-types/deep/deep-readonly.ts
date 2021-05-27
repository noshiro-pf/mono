import type { ReadonlyRecord } from '../readonly-record';
import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';

export type DeepReadonly<T> = T extends (...args: readonly unknown[]) => unknown
  ? T
  : T extends ReadonlyRecord<string, unknown> | readonly unknown[]
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

/* type test */

type Res1 = DeepReadonly<{ a: { b: { c: number[]; 1: 2 } } }>;
type Expected1 = {
  readonly a: {
    readonly b: {
      readonly c: readonly number[];
      readonly 1: 2;
    };
  };
};
assertType<TypeEq<Res1, Expected1>>();

type Res2 = DeepReadonly<{ a: { b: { c: [1, 2, 5] } } }>;
type Expected2 = {
  readonly a: {
    readonly b: {
      readonly c: readonly [1, 2, 5];
    };
  };
};

assertType<TypeEq<Res2, Expected2>>();
