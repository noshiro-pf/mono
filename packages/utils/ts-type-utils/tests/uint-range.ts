import type { TypeEq, UintRange } from '../src';
import { assertType } from './assert-type';

assertType<TypeEq<UintRange<0, 3>, 0 | 1 | 2 | 3>>();
assertType<TypeEq<UintRange<0, 0>, 0>>();
assertType<TypeEq<UintRange<1.2, 3.4>, never>>();
assertType<TypeEq<UintRange<0, 5>, 0 | 1 | 2 | 3 | 4 | 5>>();
