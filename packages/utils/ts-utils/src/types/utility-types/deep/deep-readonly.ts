import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { Primitive } from './primitive';

export type DeepReadonly<T> = T extends Primitive
  ? T
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends Set<infer V>
  ? ReadonlySet<DeepReadonly<V>>
  : // eslint-disable-next-line @typescript-eslint/ban-types
  T extends object | readonly unknown[]
  ? {
      readonly [K in keyof T]: DeepReadonly<T[K]>;
    }
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
