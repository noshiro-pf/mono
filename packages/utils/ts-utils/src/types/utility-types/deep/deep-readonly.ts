import type { ReadonlyRecordBase } from '../readonly-record-base';
import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';

export type DeepReadonly<T> = T extends (...args: readonly unknown[]) => unknown
  ? T
  : T extends ReadonlyRecordBase | readonly unknown[]
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

/* type test */

assertType<
  TypeEq<
    DeepReadonly<{ a: { b: { c: number[]; 1: 2 } } }>,
    {
      readonly a: {
        readonly b: {
          readonly c: readonly number[];
          readonly 1: 2;
        };
      };
    }
  >
>();

assertType<
  TypeEq<
    DeepReadonly<{ a: { b: { c: [1, 2, 5] } } }>,
    {
      readonly a: {
        readonly b: {
          readonly c: readonly [1, 2, 5];
        };
      };
    }
  >
>();
