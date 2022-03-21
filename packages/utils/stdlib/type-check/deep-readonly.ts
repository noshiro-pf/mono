/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

import { assertType } from './assert-type';

assertType<
  TypeEq<
    DeepReadonly<{ a: { b: { c: number[]; 1: 2 } } }>,
    {
      readonly a: {
        readonly b: {
          readonly c: readonly number[];
          readonly 1: 2;
        };
      };
    }
  >
>();

assertType<
  TypeEq<
    DeepReadonly<{ a: { b: { c: [1, 2, 5] } } }>,
    {
      readonly a: {
        readonly b: {
          readonly c: readonly [1, 2, 5];
        };
      };
    }
  >
>();

assertType<
  TypeEq<
    DeepReadonly<(x: number[], y: number[]) => number[]>,
    (x: number[], y: number[]) => number[]
  >
>();

assertType<
  TypeEq<
    DeepReadonly<{ fn: (x: number[], y: number[]) => number[] }>,
    { readonly fn: (x: number[], y: number[]) => number[] }
  >
>();
