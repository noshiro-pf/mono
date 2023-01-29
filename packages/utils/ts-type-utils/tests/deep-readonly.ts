/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

import { type DeepReadonly } from '../src';
import { expectType } from './expect-type';

expectType<
  DeepReadonly<{ a: { b: { c: number[]; 1: 2 } } }>,
  {
    readonly a: {
      readonly b: {
        readonly c: readonly number[];
        readonly 1: 2;
      };
    };
  }
>('=');

expectType<
  DeepReadonly<{ a: { b: { c: [1, 2, 5] } } }>,
  {
    readonly a: {
      readonly b: {
        readonly c: readonly [1, 2, 5];
      };
    };
  }
>('=');

expectType<
  DeepReadonly<(x: number[], y: number[]) => number[]>,
  (x: number[], y: number[]) => number[]
>('=');

expectType<
  DeepReadonly<{ fn: (x: number[], y: number[]) => number[] }>,
  { readonly fn: (x: number[], y: number[]) => number[] }
>('=');
