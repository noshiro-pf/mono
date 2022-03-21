import type { ArrayOfLength, ReadonlyArrayOfLength, TypeEq } from '../src';
import { assertType } from './assert-type';

assertType<TypeEq<[0, 0], ArrayOfLength<2, 0>>>();
assertType<TypeEq<[0, 0, 0], ArrayOfLength<3, 0>>>();
assertType<TypeEq<[0, 0, 0, 0], ArrayOfLength<4, 0>>>();
assertType<TypeEq<[0, 0, 0, 0, 0], ArrayOfLength<5, 0>>>();
assertType<TypeEq<readonly [0, 0], ReadonlyArrayOfLength<2, 0>>>();
assertType<TypeEq<readonly [0, 0, 0], ReadonlyArrayOfLength<3, 0>>>();
assertType<TypeEq<readonly [0, 0, 0, 0], ReadonlyArrayOfLength<4, 0>>>();
assertType<TypeEq<readonly [0, 0, 0, 0, 0], ReadonlyArrayOfLength<5, 0>>>();
