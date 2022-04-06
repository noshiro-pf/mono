import type { ListType, TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<ListType.Last<[]>, never>>();
assertType<TypeEq<ListType.Last<[1]>, 1>>();
assertType<TypeEq<ListType.Last<[1, 2, 3]>, 3>>();

assertType<TypeEq<ListType.Last<readonly []>, never>>();
assertType<TypeEq<ListType.Last<readonly [1]>, 1>>();
assertType<TypeEq<ListType.Last<readonly [1, 2, 3]>, 3>>();
