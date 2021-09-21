import { assertType } from '../test-type';
import type { IsNever } from './is-never';

type IsUnionSub<U, K extends U = U> = [U] extends [never]
  ? false
  : K extends unknown
  ? IsNever<StrictExclude<U, K>> extends true
    ? false
    : true
  : never;

export type IsUnion<U> = IsUnionSub<U>;

assertType<TypeEq<IsUnion<string>, false>>();
assertType<TypeEq<IsUnion<number | string>, true>>();
assertType<TypeEq<IsUnion<[number | string]>, false>>();
