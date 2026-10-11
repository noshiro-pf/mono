/* eslint-disable @stylistic/padding-line-between-statements */
import { expectType } from 'ts-data-forge';
import type {
  FixedLengthTuple,
  MutableMinLengthTuple,
  MutableNonEmptyTuple,
  NonEmptyTuple,
} from 'ts-type-forge';

{
  // embed-sample-code-ignore-above
  // ❌
  type Names = readonly [string, ...string[]];
  type Queue = [number, ...number[]];
  type Rgb = readonly [number, number, number];
  type AtLeastTwo = [string, string, ...string[]];
  // embed-sample-code-ignore-below

  expectType<Names, NonEmptyTuple<string>>('=');
  expectType<Queue, MutableNonEmptyTuple<number>>('=');
  expectType<Rgb, FixedLengthTuple<3, number>>('=');
  expectType<AtLeastTwo, MutableMinLengthTuple<2, string>>('=');
}

{
  // embed-sample-code-ignore-above
  // ✅
  type Names = NonEmptyTuple<string>;
  type Queue = MutableNonEmptyTuple<number>;
  type Rgb = FixedLengthTuple<3, number>;
  type AtLeastTwo = MutableMinLengthTuple<2, string>;
  // embed-sample-code-ignore-below

  expectType<Names, readonly [string, ...string[]]>('=');
  expectType<Queue, [number, ...number[]]>('=');
  expectType<Rgb, readonly [number, number, number]>('=');
  expectType<AtLeastTwo, [string, string, ...string[]]>('=');
}
