import { type TypeEq } from './utils';

export type BoolNot<A extends boolean> =
  //
  TypeEq<A, true> extends true
    ? false
    : TypeEq<A, false> extends true
    ? true
    : never;

export type BoolAnd<A extends boolean, B extends boolean> =
  //
  TypeEq<A, true> extends true
    ? TypeEq<B, true> extends true
      ? true
      : TypeEq<B, false> extends true
      ? false
      : never
    : TypeEq<A, false> extends true
    ? TypeEq<B, true> extends true
      ? false
      : TypeEq<B, false> extends true
      ? false
      : never
    : never;

export type BoolOr<A extends boolean, B extends boolean> =
  //
  TypeEq<A, true> extends true
    ? TypeEq<B, true> extends true
      ? true
      : TypeEq<B, false> extends true
      ? true
      : never
    : TypeEq<A, false> extends true
    ? TypeEq<B, true> extends true
      ? true
      : TypeEq<B, false> extends true
      ? false
      : never
    : never;

export type BoolEq<A extends boolean, B extends boolean> =
  //
  TypeEq<A, true> extends true
    ? TypeEq<B, true> extends true
      ? true
      : TypeEq<B, false> extends true
      ? false
      : never
    : TypeEq<A, false> extends true
    ? TypeEq<B, true> extends true
      ? false
      : TypeEq<B, false> extends true
      ? true
      : never
    : never;

export type BoolNand<A extends boolean, B extends boolean> = BoolNot<
  BoolAnd<A, B>
>;

export type BoolNor<A extends boolean, B extends boolean> = BoolNot<
  BoolOr<A, B>
>;

export type BoolNeq<A extends boolean, B extends boolean> = BoolNot<
  BoolEq<A, B>
>;
