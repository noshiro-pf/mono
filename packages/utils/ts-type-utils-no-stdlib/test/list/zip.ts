import { type ListType } from '../../src';
import { expectType } from '../expect-type';

expectType<ListType.Zip<readonly [], readonly []>, readonly []>('=');
expectType<ListType.Zip<readonly [1], readonly []>, readonly []>('=');
expectType<ListType.Zip<readonly [], readonly [1]>, readonly []>('=');

expectType<
  ListType.Zip<readonly [1, 2, 3], readonly [4, 5]>,
  readonly [readonly [1, 4], readonly [2, 5]]
>('=');

expectType<
  ListType.Zip<
    readonly [number, number, number],
    readonly [string, ...string[]]
  >,
  readonly [
    readonly [number, string],
    readonly [number, string | undefined],
    readonly [number, string | undefined]
  ]
>('=');

expectType<
  ListType.Zip<
    readonly [string, ...string[]],
    readonly [number, number, number]
  >,
  readonly [
    readonly [string, number],
    readonly [string | undefined, number],
    readonly [string | undefined, number]
  ]
>('=');

expectType<
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
>('=');

expectType<
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
>('=');