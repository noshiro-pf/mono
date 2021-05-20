import type { TypeEq } from './test-type';
import { assertType } from './test-type';

export type DeepReadonly<T> = T extends (infer R)[]
  ? readonly DeepReadonly<R>[]
  : T extends (...args: readonly unknown[]) => unknown
  ? T
  : T extends Record<string, unknown>
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

assertType<
  TypeEq<
    DeepReadonly<{ a: { b: { c: [1, 2, 3] } } }>,
    {
      readonly a: {
        readonly b: {
          readonly c: readonly (1 | 2 | 3)[];
        };
      };
    }
  >
>();
