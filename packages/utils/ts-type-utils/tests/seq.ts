import type { Seq, TypeEq } from '../src';
import { assertType } from './assert-type';

assertType<TypeEq<Seq<3>, readonly [0, 1, 2]>>();
assertType<TypeEq<Seq<0>, readonly []>>();
assertType<TypeEq<Seq<1.2>, never>>();
assertType<TypeEq<Seq<5>, readonly [0, 1, 2, 3, 4]>>();
