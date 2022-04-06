import { assertType } from '@noshiro/ts-utils';

export type BoolNot<A extends boolean> = A extends true ? false : true;

assertType<TypeEq<BoolNot<true>, false>>();
assertType<TypeEq<BoolNot<false>, true>>();

export type BoolAnd<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;

assertType<TypeEq<BoolAnd<true, true>, true>>();
assertType<TypeEq<BoolAnd<true, false>, false>>();
assertType<TypeEq<BoolAnd<false, true>, false>>();
assertType<TypeEq<BoolAnd<false, false>, false>>();

export type BoolOr<A extends boolean, B extends boolean> = A extends false
  ? B extends false
    ? false
    : true
  : true;

assertType<TypeEq<BoolOr<true, true>, true>>();
assertType<TypeEq<BoolOr<true, false>, true>>();
assertType<TypeEq<BoolOr<false, true>, true>>();
assertType<TypeEq<BoolOr<false, false>, false>>();

export type BoolNand<A extends boolean, B extends boolean> = BoolNot<
  BoolAnd<A, B>
>;

assertType<TypeEq<BoolNand<true, true>, false>>();
assertType<TypeEq<BoolNand<true, false>, true>>();
assertType<TypeEq<BoolNand<false, true>, true>>();
assertType<TypeEq<BoolNand<false, false>, true>>();

export type BoolNor<A extends boolean, B extends boolean> = BoolNot<
  BoolOr<A, B>
>;

assertType<TypeEq<BoolNor<true, true>, false>>();
assertType<TypeEq<BoolNor<true, false>, false>>();
assertType<TypeEq<BoolNor<false, true>, false>>();
assertType<TypeEq<BoolNor<false, false>, true>>();

export type BoolEq<A extends boolean, B extends boolean> = BoolOr<
  BoolAnd<A, B>,
  BoolAnd<BoolNot<A>, BoolNot<B>>
>;

assertType<TypeEq<BoolEq<true, true>, true>>();
assertType<TypeEq<BoolEq<true, false>, false>>();
assertType<TypeEq<BoolEq<false, true>, false>>();
assertType<TypeEq<BoolEq<false, false>, true>>();

export type BoolNeq<A extends boolean, B extends boolean> = BoolNot<
  BoolEq<A, B>
>;

assertType<TypeEq<BoolNeq<true, true>, false>>();
assertType<TypeEq<BoolNeq<true, false>, true>>();
assertType<TypeEq<BoolNeq<false, true>, true>>();
assertType<TypeEq<BoolNeq<false, false>, false>>();
