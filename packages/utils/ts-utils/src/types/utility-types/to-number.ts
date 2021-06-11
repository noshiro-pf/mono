import type { MakeTuple, MakeTupleImpl } from './make-tuple';
import type { TypeEq } from './test-type';
import { assertType } from './test-type';
import type { ReadonlyTupleTail } from './tuple';

// config
type DigitUpperLimit = 4;

export type ToNumber<S extends `${number}`> = IsSmallNumber<S> extends true
  ? MakeTupleImpl<unknown, S>['length']
  : S;

type IsSmallNumber<S extends `${number}`> = IsSmallNumberImpl<
  S,
  MakeTuple<unknown, DigitUpperLimit>
>;

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Tail<T extends string> = T extends `${Digit}${infer U}` ? U : never;

type IsSmallNumberImpl<S extends string, Counter extends readonly unknown[]> =
  S extends ''
    ? true
    : TypeEq<Counter, readonly []> extends true
    ? false // reached the limit
    : IsSmallNumberImpl<Tail<S>, ReadonlyTupleTail<Counter>>;

assertType<TypeEq<ToNumber<'1000'>, 1000>>();
assertType<TypeEq<ToNumber<'8192'>, 8192>>();
assertType<TypeEq<ToNumber<'9999'>, 9999>>();
assertType<TypeEq<ToNumber<'10000'>, '10000'>>();
