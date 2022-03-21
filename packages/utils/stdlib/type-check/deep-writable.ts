import { assertType } from './assert-type';

assertType<
  TypeEq<
    DeepWritable<{
      readonly a: {
        readonly b: {
          readonly c: [1, 2, 3];
          readonly d: (xs: number[]) => number;
          readonly 1: 2;
        };
      };
    }>,
    {
      a: {
        b: {
          c: [1, 2, 3];
          // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
          d: (xs: number[]) => number;
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
