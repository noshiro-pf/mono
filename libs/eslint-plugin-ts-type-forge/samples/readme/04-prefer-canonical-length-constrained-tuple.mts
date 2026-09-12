/* eslint-disable @stylistic/padding-line-between-statements */
import { expectType } from 'ts-data-forge';
import {
  type FixedLengthTuple,
  type MutableMinLengthTuple,
  type MutableNonEmptyTuple,
  type NonEmptyTuple,
} from 'ts-type-forge';

// embed-sample-code-ignore-above
/* embed-sample-code-ignore-this-line */ // prettier-ignore
/* embed-sample-code-ignore-this-line */ {
  // ❌
  type Names = readonly [string, ...string[]];
  type Queue = [number, ...number[]];
  type Rgb = readonly [number, number, number];
  type AtLeastTwo = [string, string, ...string[]];

  /* embed-sample-code-ignore-this-line */ expectType<Names, NonEmptyTuple<string>>('=');
  /* embed-sample-code-ignore-this-line */ expectType<Queue, MutableNonEmptyTuple<number>>('=');
  /* embed-sample-code-ignore-this-line */ expectType<Rgb, FixedLengthTuple<3, number>>('=');
  /* embed-sample-code-ignore-this-line */ expectType<AtLeastTwo, MutableMinLengthTuple<2, string>>('=');
/* embed-sample-code-ignore-this-line */ }

/* embed-sample-code-ignore-this-line */ // prettier-ignore
/* embed-sample-code-ignore-this-line */ {
  // ✅
  type Names = NonEmptyTuple<string>;
  type Queue = MutableNonEmptyTuple<number>;
  type Rgb = FixedLengthTuple<3, number>;
  type AtLeastTwo = MutableMinLengthTuple<2, string>;

  /* embed-sample-code-ignore-this-line */ expectType<Names, readonly [string, ...string[]]>('=');
  /* embed-sample-code-ignore-this-line */ expectType<Queue, [number, ...number[]]>('=');
  /* embed-sample-code-ignore-this-line */ expectType<Rgb, readonly [number, number, number]>('=');
  /* embed-sample-code-ignore-this-line */ expectType<AtLeastTwo, [string, string, ...string[]]>('=');
/* embed-sample-code-ignore-this-line */ }
