import type { ArrayOfLength, MutableArrayOfLength, TypeEq } from '../src';
import { assertType } from './assert-type';

assertType<TypeEq<[0, 0], MutableArrayOfLength<2, 0>>>();
assertType<TypeEq<[0, 0, 0], MutableArrayOfLength<3, 0>>>();
assertType<TypeEq<[0, 0, 0, 0], MutableArrayOfLength<4, 0>>>();
assertType<TypeEq<[0, 0, 0, 0, 0], MutableArrayOfLength<5, 0>>>();
assertType<TypeEq<readonly [0, 0], ArrayOfLength<2, 0>>>();
assertType<TypeEq<readonly [0, 0, 0], ArrayOfLength<3, 0>>>();
assertType<TypeEq<readonly [0, 0, 0, 0], ArrayOfLength<4, 0>>>();
assertType<TypeEq<readonly [0, 0, 0, 0, 0], ArrayOfLength<5, 0>>>();
