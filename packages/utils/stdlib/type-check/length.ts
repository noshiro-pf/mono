import { assertType } from './assert-type';

assertType<TypeEq<Length<readonly [1, 2, 3]>, 3>>();
