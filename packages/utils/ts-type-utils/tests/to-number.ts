import type { ToNumber, TypeEq } from '../src';
import { assertType } from './assert-type';

assertType<TypeEq<ToNumber<'1000'>, 1000>>();
assertType<TypeEq<ToNumber<'8192'>, 8192>>();
assertType<TypeEq<ToNumber<'9999'>, 9999>>();
assertType<TypeEq<ToNumber<'10000'>, 10_000>>();
