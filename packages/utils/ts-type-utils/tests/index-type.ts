import type { Index, TypeEq } from '../src';
import { assertType } from './assert-type';

assertType<TypeEq<Index<3>, 0 | 1 | 2>>();
assertType<TypeEq<Index<0>, never>>();
assertType<TypeEq<Index<1.2>, never>>();
assertType<TypeEq<Index<5>, 0 | 1 | 2 | 3 | 4>>();
