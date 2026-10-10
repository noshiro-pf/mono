/* eslint-disable @typescript-eslint/no-unused-vars, @stylistic/padding-line-between-statements */
import { expectType } from 'ts-data-forge';
import {
  type FixedLengthTuple,
  type MaxLengthTuple,
  type NonEmptyArray,
} from 'ts-type-forge';
// embed-sample-code-ignore-above
import * as t from 'ts-fortress';
// embed-sample-code-ignore-below

{
  // embed-sample-code-ignore-above
  // ❌
  const Tags = t.minLengthArray(1, t.string());
  const Rgb = t.boundedLengthTuple(3, 3, t.number());
  const Page = t.boundedLengthTuple(0, 10, t.string());
  // embed-sample-code-ignore-below

  expectType<t.TypeOf<typeof Tags>, NonEmptyArray<string>>('=');
  expectType<t.TypeOf<typeof Rgb>, FixedLengthTuple<3, number>>('=');
  expectType<t.TypeOf<typeof Page>, MaxLengthTuple<10, string>>('=');
}

{
  // embed-sample-code-ignore-above
  // ✅
  const Tags = t.nonEmptyArray(t.string());
  const Rgb = t.fixedLengthTuple(3, t.number());
  const Page = t.maxLengthTuple(10, t.string());
  // embed-sample-code-ignore-below

  expectType<t.TypeOf<typeof Tags>, NonEmptyArray<string>>('=');
  expectType<t.TypeOf<typeof Rgb>, FixedLengthTuple<3, number>>('=');
  expectType<t.TypeOf<typeof Page>, MaxLengthTuple<10, string>>('=');
}
