import type {
  DeepReadonly,
  KeyPathAndValueTypeAtPathTuple,
  Paths,
  TypeEq,
} from '../../src';
import { assertType } from '../assert-type';

type R0 = DeepReadonly<{
  x: {
    a: 1;
    b: { x: [number, ...string[]] }[];
  };
  y: {
    c: {
      d: { x: number }[];
      4: 5;
    };
    g: [{ x: number }, ...{ y: string[] }[]];
    h: (a: number) => string;
    i: (a: string) => number;
  };
  z: [1, 2, { e: 3; f: [6, 7] }];
}>;

assertType<TypeEq<KeyPathAndValueTypeAtPathTuple<R0>[0], Paths<R0>>>();

assertType<
  TypeEq<
    DeepReadonly<
      | [
          ['y', 'c'],
          {
            d: { x: number }[];
            4: 5;
          }
        ]
      | [
          ['y'],
          {
            c: {
              d: { x: number }[];
              4: 5;
            };
            g: [{ x: number }, ...{ y: string[] }[]];
            h: (a: number) => string;
            i: (a: string) => number;
          }
        ]
      | [['x', 'a'], 1]
      | [['x', 'b'], { x: [number, ...string[]] }[]]
      | [['x'], { a: 1; b: { x: [number, ...string[]] }[] }]
      | [['y', 'c', 'd'], { x: number }[]]
      | [['y', 'c', 4], 5]
      | [['y', 'g'], [{ x: number }, ...{ y: string[] }[]]]
      | [['y', 'h'], (a: number) => string]
      | [['y', 'i'], (a: string) => number]
      | [['z', 0], 1]
      | [['z', 1], 2]
      | [['z', 2, 'e'], 3]
      | [['z', 2, 'f', 0], 6]
      | [['z', 2, 'f', 1], 7]
      | [['z', 2, 'f'], [6, 7]]
      | [['z', 2], { e: 3; f: [6, 7] }]
      | [['z'], [1, 2, { e: 3; f: [6, 7] }]]
      | [[], R0]
    >,
    KeyPathAndValueTypeAtPathTuple<R0>
  >
>();
