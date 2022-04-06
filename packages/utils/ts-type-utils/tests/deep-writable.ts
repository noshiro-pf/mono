import type { DeepWritable, TypeEq } from '../src';
import { assertType } from './assert-type';

assertType<
  TypeEq<
    DeepWritable<{
      readonly a: {
        readonly b: {
          readonly c: [1, 2, 3];
          readonly d: (xs: readonly number[]) => number;
          readonly 1: 2;
        };
      };
    }>,
    {
      a: {
        b: {
          c: [1, 2, 3];
          d: (xs: readonly number[]) => number;
          1: 2;
        };
      };
    }
  >
>();

assertType<
  TypeEq<
    DeepWritable<{
      readonly a: { readonly b: { readonly c: readonly [1, 2, 5] } };
    }>,
    {
      a: {
        b: {
          c: [1, 2, 5];
        };
      };
    }
  >
>();
