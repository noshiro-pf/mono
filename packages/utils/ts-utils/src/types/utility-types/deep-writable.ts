import type { TypeEq } from './test-type';
import { assertType } from './test-type';

export type DeepWritable<T> = T extends (infer R)[]
  ? DeepWritable<R>[]
  : T extends (...args: readonly unknown[]) => unknown
  ? T
  : T extends Record<string, unknown>
  ? { -readonly [P in keyof T]: DeepWritable<T[P]> }
  : T;

assertType<
  TypeEq<
    DeepWritable<{
      readonly a: {
        readonly b: {
          readonly c: [1, 2, 3];
          readonly d: (xs: readonly number[]) => number;
        };
      };
    }>,
    {
      a: {
        b: {
          c: (1 | 2 | 3)[];
          d: (xs: readonly number[]) => number;
        };
      };
    }
  >
>();
