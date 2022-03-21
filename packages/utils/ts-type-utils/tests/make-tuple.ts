import type { MakeTuple, TypeEq } from '../src';
import { assertType } from './assert-type';

assertType<
  TypeEq<MakeTuple<unknown, 3>, readonly [unknown, unknown, unknown]>
>();
