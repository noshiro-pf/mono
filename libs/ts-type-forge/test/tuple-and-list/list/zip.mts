import { expectType } from '../../expect-type.mjs';

expectType<List.Zip<readonly [], readonly []>, readonly []>('=');
expectType<List.Zip<readonly [1], readonly []>, readonly []>('=');
expectType<List.Zip<readonly [], readonly [1]>, readonly []>('=');

// <= かつ >= だが "=" だとエラーになってしまう
expectType<
  List.Zip<ArrayOfLength<32, 1>, ArrayOfLength<32, 2>>,
  ArrayOfLength<32, readonly [1, 2]>
>('<=');
expectType<
  ArrayOfLength<32, readonly [1, 2]>,
  List.Zip<ArrayOfLength<32, 1>, ArrayOfLength<32, 2>>
>('<=');

expectType<
  List.Zip<readonly [1, 2, 3], readonly [4, 5]>,
  readonly [readonly [1, 4], readonly [2, 5]]
>('=');

expectType<
  List.Zip<readonly [number, number, number], readonly [string]>,
  readonly [readonly [number, string]]
>('=');

expectType<
  List.Zip<readonly [number], readonly [string, ...string[]]>,
  readonly [readonly [number, string]]
>('=');

expectType<
  List.Zip<readonly [number], readonly [...string[]]>,
  readonly [readonly [number, string]]
>('=');

expectType<
  List.Zip<readonly [string, ...string[]], readonly [number, number, number]>,
  readonly [
    readonly [string, number],
    readonly [string, number],
    readonly [string, number],
  ]
>('~='); // "=" にできない原因は不明

expectType<
  List.Zip<readonly [boolean, ...string[]], readonly [number, number, number]>,
  readonly [
    readonly [boolean, number],
    readonly [string, number],
    readonly [string, number],
  ]
>('=');

expectType<
  List.Zip<
    readonly [number, number, number, ...number[]],
    readonly [boolean, ...string[]]
  >,
  readonly [
    readonly [number, boolean],
    readonly [number, string],
    readonly [number, string],
    ...(readonly [number, string])[],
  ]
>('=');

expectType<
  List.Zip<
    readonly [boolean, ...string[]],
    readonly [number, number, number, ...number[]]
  >,
  readonly [
    readonly [boolean, number],
    readonly [string, number],
    readonly [string, number],
    ...(readonly [string, number])[],
  ]
>('=');
