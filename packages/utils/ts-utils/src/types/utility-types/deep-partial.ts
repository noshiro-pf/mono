import type { TypeEq } from './test-type';
import { assertType } from './test-type';

export type DeepPartial<T> = T extends (infer R)[]
  ? DeepPartial<R>[]
  : T extends (...args: readonly unknown[]) => unknown
  ? T
  : T extends Record<string, unknown>
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

assertType<
  TypeEq<
    DeepPartial<{ a: { b: { c: [1, 2, 3] } } }>,
    {
      a?: {
        b?: {
          c?: (1 | 2 | 3)[];
        };
      };
    }
  >
>();
