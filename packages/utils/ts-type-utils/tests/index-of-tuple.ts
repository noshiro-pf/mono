import { type IndexOfTuple, type TypeEq } from '../src';
import { assertType } from './assert-type';

// assertType<TypeEq<IndexOfTuple<readonly [1, 2, 3]>, '0' | '1' | '2'>>();
assertType<TypeEq<IndexOfTuple<readonly [1, 2, 3]>, 0 | 1 | 2>>();
assertType<TypeEq<IndexOfTuple<readonly unknown[]>, number>>();
