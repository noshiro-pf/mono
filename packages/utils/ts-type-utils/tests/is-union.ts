import type { IsUnion, TypeEq } from '../src';
import { assertType } from './assert-type';

assertType<TypeEq<IsUnion<string>, false>>();
assertType<TypeEq<IsUnion<number | string>, true>>();
assertType<TypeEq<IsUnion<[number | string]>, false>>();
