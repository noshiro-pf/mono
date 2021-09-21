import { assertType } from '../test-type';
import type { ListHead } from './head';
import type { ListTail, ReadonlyListTail } from './tail';

export type ListZip<
  A extends readonly unknown[],
  B extends readonly unknown[]
> = {
  0: [];
  1: [[ListHead<A>, ListHead<B>], ...ListZip<ListTail<A>, ListTail<B>>];
  2: [
    [ListHead<A>, B[number] | undefined],
    ...ListZip<ListTail<A>, ListTail<B>>
  ];
  3: [
    [A[number] | undefined, ListHead<B>],
    ...ListZip<ListTail<A>, ListTail<B>>
  ];
  4: [A[number], B[number]][];
}[A extends readonly []
  ? 0
  : B extends readonly []
  ? 0
  : A extends readonly [unknown, ...(readonly unknown[])]
  ? B extends readonly [unknown, ...(readonly unknown[])]
    ? 1 // both A and B has at least 1 element
    : 2 // A has at least 1 element but B doesn't
  : B extends readonly [unknown, ...(readonly unknown[])]
  ? 3 // B has at least 1 element but A doesn't
  : 4];

assertType<TypeEq<ListZip<readonly [], readonly []>, []>>();
assertType<TypeEq<ListZip<readonly [1], readonly []>, []>>();
assertType<TypeEq<ListZip<readonly [], readonly [1]>, []>>();

assertType<
  TypeEq<ListZip<readonly [1, 2, 3], readonly [4, 5]>, [[1, 4], [2, 5]]>
>();

assertType<
  TypeEq<
    ListZip<readonly [number, number, number], readonly [string, ...string[]]>,
    [
      [number, string],
      [number, string | undefined],
      [number, string | undefined]
    ]
  >
>();

assertType<
  TypeEq<
    ListZip<readonly [string, ...string[]], readonly [number, number, number]>,
    [
      [string, number],
      [string | undefined, number],
      [string | undefined, number]
    ]
  >
>();

assertType<
  TypeEq<
    ListZip<
      readonly [number, number, number, ...number[]],
      readonly [string, ...string[]]
    >,
    [
      [number, string],
      [number, string | undefined],
      [number, string | undefined],
      ...[number, string][]
    ]
  >
>();

assertType<
  TypeEq<
    ListZip<
      readonly [string, ...string[]],
      readonly [number, number, number, ...number[]]
    >,
    [
      [string, number],
      [string | undefined, number],
      [string | undefined, number],
      ...[string, number][]
    ]
  >
>();

export type ReadonlyListZip<
  A extends readonly unknown[],
  B extends readonly unknown[]
> = {
  0: readonly [];
  1: readonly [
    readonly [ListHead<A>, ListHead<B>],
    ...ReadonlyListZip<ReadonlyListTail<A>, ReadonlyListTail<B>>
  ];
  2: readonly [
    readonly [ListHead<A>, B[number] | undefined],
    ...ReadonlyListZip<ReadonlyListTail<A>, ReadonlyListTail<B>>
  ];
  3: readonly [
    readonly [A[number] | undefined, ListHead<B>],
    ...ReadonlyListZip<ReadonlyListTail<A>, ReadonlyListTail<B>>
  ];
  4: readonly (readonly [A[number], B[number]])[];
}[A extends readonly []
  ? 0
  : B extends readonly []
  ? 0
  : A extends readonly [unknown, ...(readonly unknown[])]
  ? B extends readonly [unknown, ...(readonly unknown[])]
    ? 1 // both A and B has at least 1 element
    : 2 // A has at least 1 element but B doesn't
  : B extends readonly [unknown, ...(readonly unknown[])]
  ? 3 // B has at least 1 element but A doesn't
  : 4];

assertType<TypeEq<ReadonlyListZip<readonly [], readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyListZip<readonly [1], readonly []>, readonly []>>();
assertType<TypeEq<ReadonlyListZip<readonly [], readonly [1]>, readonly []>>();

assertType<
  TypeEq<
    ReadonlyListZip<readonly [1, 2, 3], readonly [4, 5]>,
    readonly [readonly [1, 4], readonly [2, 5]]
  >
>();

assertType<
  TypeEq<
    ReadonlyListZip<
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
    ReadonlyListZip<
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
    ReadonlyListZip<
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
    ReadonlyListZip<
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
