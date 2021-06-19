import type { IsFixedLengthList } from './is-fixed-length-list';
import type { TypeEq } from './test-type';
import { assertType } from './test-type';
import type { ToNumber } from './to-number';

export type IndexOfTuple<T extends readonly unknown[], K = keyof T> =
  IsFixedLengthList<T> extends true
    ? K extends keyof T
      ? K extends `${number}`
        ? ToNumber<K>
        : never
      : never
    : number;

// assertType<TypeEq<IndexOfTuple<readonly [1, 2, 3]>, '0' | '1' | '2'>>();
assertType<TypeEq<IndexOfTuple<readonly [1, 2, 3]>, 0 | 1 | 2>>();
assertType<TypeEq<IndexOfTuple<readonly unknown[]>, number>>();
