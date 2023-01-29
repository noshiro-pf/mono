/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

import { type DeepPartial, type TypeEq } from '../src';
import { assertType } from './assert-type';

assertType<
  TypeEq<
    DeepPartial<{ a: { b: { c: number[]; 1: 2 } } }>,
    {
      a?: {
        b?: {
          c?: (number | undefined)[];
          1?: 2;
        };
      };
    }
  >
>();

assertType<
  TypeEq<
    DeepPartial<{ a: { b: { c: [1, 2, 5] } } }>,
    {
      a?: {
        b?: {
          c?:
            | [(1 | undefined)?, (2 | undefined)?, (5 | undefined)?]
            | undefined;
        };
      };
    }
  >
>();
