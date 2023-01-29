import { type ListType, type TypeEq } from '../../src';
import { assertType } from '../assert-type';

assertType<TypeEq<ListType.Zip<readonly [], readonly []>, readonly []>>();
assertType<TypeEq<ListType.Zip<readonly [1], readonly []>, readonly []>>();
assertType<TypeEq<ListType.Zip<readonly [], readonly [1]>, readonly []>>();

assertType<
  TypeEq<
    ListType.Zip<readonly [1, 2, 3], readonly [4, 5]>,
    readonly [readonly [1, 4], readonly [2, 5]]
  >
>();

assertType<
  TypeEq<
    ListType.Zip<
      readonly [number, number, number],
      readonly [string, ...string[]]
    >,
    readonly [
      readonly [number, string],
      readonly [number, string | undefined],
      readonly [number, string | undefined]
    ]
  >
>();

assertType<
  TypeEq<
    ListType.Zip<
      readonly [string, ...string[]],
      readonly [number, number, number]
    >,
    readonly [
      readonly [string, number],
      readonly [string | undefined, number],
      readonly [string | undefined, number]
    ]
  >
>();

assertType<
  TypeEq<
    ListType.Zip<
      readonly [number, number, number, ...number[]],
      readonly [string, ...string[]]
    >,
    readonly [
      readonly [number, string],
      readonly [number, string | undefined],
      readonly [number, string | undefined],
      ...(readonly [number, string])[]
    ]
  >
>();

assertType<
  TypeEq<
    ListType.Zip<
      readonly [string, ...string[]],
      readonly [number, number, number, ...number[]]
    >,
    readonly [
      readonly [string, number],
      readonly [string | undefined, number],
      readonly [string | undefined, number],
      ...(readonly [string, number])[]
    ]
  >
>();
