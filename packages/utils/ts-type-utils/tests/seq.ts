import type { Seq, TypeEq } from '../src';
import { assertType } from './assert-type';

assertType<TypeEq<Seq<3>, 0 | 1 | 2>>();
assertType<TypeEq<Seq<0>, never>>();
assertType<TypeEq<Seq<1.2>, never>>();
assertType<TypeEq<Seq<5>, 0 | 1 | 2 | 3 | 4>>();
