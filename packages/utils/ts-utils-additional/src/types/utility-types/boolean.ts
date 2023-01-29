import { expectType } from '@noshiro/ts-utils';

export type BoolNot<A extends boolean> = A extends true ? false : true;

expectType<BoolNot<true>, false>('=');
expectType<BoolNot<false>, true>('=');

export type BoolAnd<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;

expectType<BoolAnd<true, true>, true>('=');
expectType<BoolAnd<true, false>, false>('=');
expectType<BoolAnd<false, true>, false>('=');
expectType<BoolAnd<false, false>, false>('=');

export type BoolOr<A extends boolean, B extends boolean> = A extends false
  ? B extends false
    ? false
    : true
  : true;

expectType<BoolOr<true, true>, true>('=');
expectType<BoolOr<true, false>, true>('=');
expectType<BoolOr<false, true>, true>('=');
expectType<BoolOr<false, false>, false>('=');

export type BoolNand<A extends boolean, B extends boolean> = BoolNot<
  BoolAnd<A, B>
>;

expectType<BoolNand<true, true>, false>('=');
expectType<BoolNand<true, false>, true>('=');
expectType<BoolNand<false, true>, true>('=');
expectType<BoolNand<false, false>, true>('=');

export type BoolNor<A extends boolean, B extends boolean> = BoolNot<
  BoolOr<A, B>
>;

expectType<BoolNor<true, true>, false>('=');
expectType<BoolNor<true, false>, false>('=');
expectType<BoolNor<false, true>, false>('=');
expectType<BoolNor<false, false>, true>('=');

export type BoolEq<A extends boolean, B extends boolean> = BoolOr<
  BoolAnd<A, B>,
  BoolAnd<BoolNot<A>, BoolNot<B>>
>;

expectType<BoolEq<true, true>, true>('=');
expectType<BoolEq<true, false>, false>('=');
expectType<BoolEq<false, true>, false>('=');
expectType<BoolEq<false, false>, true>('=');

export type BoolNeq<A extends boolean, B extends boolean> = BoolNot<
  BoolEq<A, B>
>;

expectType<BoolNeq<true, true>, false>('=');
expectType<BoolNeq<true, false>, true>('=');
expectType<BoolNeq<false, true>, true>('=');
expectType<BoolNeq<false, false>, false>('=');
