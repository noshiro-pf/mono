import { type ListType, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<ListType.Head<[]>, never>>();
assertType<TypeEq<ListType.Head<number[]>, never>>();
assertType<TypeEq<ListType.Head<[number, ...number[]], 0>, number>>();
assertType<TypeEq<ListType.Head<number[], 1>, 1>>();

assertType<TypeEq<ListType.Head<readonly []>, never>>();
assertType<TypeEq<ListType.Head<readonly number[]>, never>>();
assertType<
  TypeEq<ListType.Head<readonly [number, ...(readonly number[])], 0>, number>
>();
assertType<TypeEq<ListType.Head<readonly number[], 1>, 1>>();
